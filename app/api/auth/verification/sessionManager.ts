/**
 * Session Management Utility
 * Handles session expiration, token validation, and automatic logout
 */

export const SESSION_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes of inactivity
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh token 5 minutes before expiry
  CHECK_INTERVAL: 60 * 1000, // Check session every 1 minute
};

export class SessionManager {
  private static lastActivityTime = Date.now();
  private static sessionCheckInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize session monitoring
   */
  static initializeSessionMonitoring(onSessionExpire: () => void) {
    // Update last activity on user interactions
    const updateActivity = () => {
      this.lastActivityTime = Date.now();
      localStorage.setItem('lastActivityTime', String(this.lastActivityTime));
    };

    // Attach event listeners for user activity
    document.addEventListener('mousedown', updateActivity);
    document.addEventListener('keydown', updateActivity);
    document.addEventListener('scroll', updateActivity);
    document.addEventListener('touchstart', updateActivity);

    // Start periodic session check
    this.sessionCheckInterval = setInterval(() => {
      this.checkSessionValidity(onSessionExpire);
    }, SESSION_CONFIG.CHECK_INTERVAL);

    // Set initial activity time
    updateActivity();

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', updateActivity);
      document.removeEventListener('keydown', updateActivity);
      document.removeEventListener('scroll', updateActivity);
      document.removeEventListener('touchstart', updateActivity);
      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval);
      }
    };
  }

  /**
   * Check if session is still valid
   */
  static async checkSessionValidity(onSessionExpire: () => void): Promise<boolean> {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) {
        onSessionExpire();
        return false;
      }

      // Check inactivity timeout
      const lastActivity = localStorage.getItem('lastActivityTime');
      if (lastActivity) {
        const inactivityDuration = Date.now() - parseInt(lastActivity);
        if (inactivityDuration > SESSION_CONFIG.SESSION_TIMEOUT) {
          console.warn('Session expired due to inactivity');
          onSessionExpire();
          return false;
        }
      }

      // Validate token with server
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        console.warn('Token validation failed');
        onSessionExpire();
        return false;
      }

      const data = await response.json();
      
      // Check if token needs refresh
      if (data.needsRefresh) {
        await this.refreshToken();
      }

      return data.valid;
    } catch (error) {
      console.error('Session check error:', error);
      // Don't auto-logout on network errors, just log
      return true;
    }
  }

  /**
   * Refresh the authentication token
   */
  static async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('supabase.auth.token', data.token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Get remaining session time in milliseconds
   */
  static getRemainingSessionTime(): number {
    const lastActivity = localStorage.getItem('lastActivityTime');
    if (!lastActivity) return SESSION_CONFIG.SESSION_TIMEOUT;

    const inactivityDuration = Date.now() - parseInt(lastActivity);
    const remaining = SESSION_CONFIG.SESSION_TIMEOUT - inactivityDuration;

    return Math.max(0, remaining);
  }

  /**
   * Extend session by resetting activity time
   */
  static extendSession(): void {
    this.lastActivityTime = Date.now();
    localStorage.setItem('lastActivityTime', String(this.lastActivityTime));
  }

  /**
   * Clear session data
   */
  static clearSession(): void {
    localStorage.removeItem('lastActivityTime');
    localStorage.removeItem('supabase.auth.token');
    Object.keys(localStorage).forEach((key) => {
      if (/^sb-.*-auth-token$/.test(key)) {
        localStorage.removeItem(key);
      }
    });
  }
}

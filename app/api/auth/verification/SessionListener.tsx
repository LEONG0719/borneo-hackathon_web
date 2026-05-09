"use client";

import { useEffect, useState } from "react";
import { SessionManager, SESSION_CONFIG } from "./sessionManager";
import { Logout } from "./authUtils";

/**
 * SessionListener Component
 * Monitors user session and automatically logs out when session expires
 * Must be placed in the root layout to work globally
 */
export default function SessionListener() {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    // Get the token to check if user is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('supabase.auth.token') : null;
    
    if (!token) {
      return; // User not logged in, skip session monitoring
    }

    // Initialize session monitoring
    const cleanup = SessionManager.initializeSessionMonitoring(async () => {
      // Handle session expiration
      console.log("Session expired, logging out...");
      setShowWarning(false);
      await Logout();
    });

    // Update remaining time display every 10 seconds
    const timerInterval = setInterval(() => {
      const remaining = SessionManager.getRemainingSessionTime();
      setRemainingTime(remaining);

      // Show warning when 5 minutes or less remaining
      if (remaining > 0 && remaining <= 5 * 60 * 1000 && !showWarning) {
        setShowWarning(true);
      } else if (remaining > 5 * 60 * 1000 && showWarning) {
        setShowWarning(false);
      }
    }, 10000);

    return () => {
      cleanup();
      clearInterval(timerInterval);
    };
  }, [showWarning]);

  // Handle session extension when user clicks "Continue Session"
  const handleExtendSession = () => {
    SessionManager.extendSession();
    setShowWarning(false);
    setRemainingTime(SESSION_CONFIG.SESSION_TIMEOUT);
  };

  // Format time remaining in MM:SS format
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          maxWidth: '400px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginTop: 0, color: '#333' }}>Session Expiring Soon</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Your session will expire in <strong>{formatTime(remainingTime)}</strong> due to inactivity.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => Logout()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          >
            Logout
          </button>
          <button
            onClick={handleExtendSession}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: 'white',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
          >
            Continue Session
          </button>
        </div>
      </div>
    </div>
  );
}

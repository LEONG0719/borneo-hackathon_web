# Session Management & Automatic Logout System

## Overview

This implementation adds comprehensive session management to your BorNEO AI application. The system automatically monitors user sessions and logs out users when their session expires due to inactivity.

## Features

✅ **Automatic Session Timeout** - Logs out users after 30 minutes of inactivity  
✅ **Session Expiration Warning** - Shows a warning 5 minutes before logout  
✅ **Activity Tracking** - Resets inactivity timer on mouse, keyboard, scroll, and touch events  
✅ **Token Validation** - Continuously validates tokens with the server  
✅ **Token Refresh** - Automatically refreshes expired tokens  
✅ **Graceful Logout** - Clears all session data and redirects to home page  

## How It Works

### 1. **SessionManager** (`sessionManager.ts`)

Core utility class that handles session lifecycle:

- **Initialization**: Sets up event listeners for user activity (mouse, keyboard, scroll, touch)
- **Activity Tracking**: Updates last activity timestamp whenever user interacts with the page
- **Periodic Checks**: Validates session every 60 seconds
- **Timeout Detection**: Logs out if inactivity exceeds 30 minutes
- **Token Validation**: Calls server API to verify token validity

```typescript
// Configuration
SESSION_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000,           // 30 minutes
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000,   // 5 minutes before expiry
  CHECK_INTERVAL: 60 * 1000,                 // Check every minute
}
```

### 2. **SessionListener Component** (`SessionListener.tsx`)

React component that monitors and displays session status:

- **Real-time Monitoring**: Runs in the background monitoring session validity
- **Warning Modal**: Shows countdown timer when session is about to expire
- **User Actions**: 
  - "Continue Session" - Extends the session by 30 minutes
  - "Logout" - Immediately logs out the user
- **Automatic Logout**: If no action taken, automatically logs out when time expires

### 3. **API Routes**

#### `/api/auth/validate` (POST)
Validates the current authentication token

**Request:**
```json
{ "token": "supabase_access_token" }
```

**Response:**
```json
{
  "valid": true,
  "needsRefresh": false,
  "user": { "id": "user_id", "email": "user@example.com" }
}
```

#### `/api/auth/refresh` (POST)
Refreshes an expired authentication token

**Request:**
```json
{ "refreshToken": "supabase_refresh_token" }
```

**Response:**
```json
{
  "token": "new_access_token",
  "refreshToken": "new_refresh_token",
  "expiresAt": 1234567890
}
```

### 4. **Updated Components**

#### **UserIdProvider** (`provider/UserIdProvider.tsx`)
- Now validates token on initialization
- Checks if session is still valid before displaying user data
- Automatically logs out if token is invalid or expired

#### **Layout** (`app/layout.tsx`)
- Integrated SessionListener component
- SessionListener runs globally for all authenticated users

## Usage

### Session automatically expires in these scenarios:

1. **Inactivity Timeout** - 30 minutes without any user interaction
2. **Token Expiration** - Supabase token has expired
3. **Server Validation Failure** - Server-side validation returns invalid

### User Actions:

1. **Continue Session** - Click button when warning appears (resets 30-minute timer)
2. **Logout** - Click logout button in warning or use existing logout UI
3. **Automatic Logout** - If no action taken after 5-minute warning

## Configuration

To customize timeout settings, edit `sessionManager.ts`:

```typescript
export const SESSION_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000,           // Change to desired minutes
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000,   // Warning threshold
  CHECK_INTERVAL: 60 * 1000,                 // Validation check frequency
};
```

### Recommended values:
- **Development**: 5 minutes (SESSION_TIMEOUT: 5 * 60 * 1000)
- **Production**: 30 minutes (SESSION_TIMEOUT: 30 * 60 * 1000)
- **High Security**: 15 minutes (SESSION_TIMEOUT: 15 * 60 * 1000)

## Architecture

```
┌─────────────────────────────────────────┐
│          Root Layout                     │
├─────────────────────────────────────────┤
│  ┌──────────────────────────────────┐   │
│  │  AuthListener (Magic Links)      │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  SessionListener (Monitoring)    │   │
│  │  ├─ Activity Tracking            │   │
│  │  ├─ Session Validation (60s)     │   │
│  │  ├─ Warning Modal (5 min left)   │   │
│  │  └─ Auto-logout                  │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  UserIdProvider                  │   │
│  │  ├─ Token Validation on Load     │   │
│  │  └─ Session Context              │   │
│  └──────────────────────────────────┘   │
│         App Components                   │
└─────────────────────────────────────────┘
```

## LocalStorage Keys

The system uses these localStorage keys:

- `supabase.auth.token` - Current access token
- `lastActivityTime` - Timestamp of last user activity
- `sb-*-auth-token` - Supabase auth token (cleaned on logout)

## Flow Diagram

```
User Logs In
    ↓
Token stored in localStorage
    ↓
SessionListener initialized
    ↓
[User Activity Detected]
    ↓
Activity timestamp updated
    ↓
[Every 60 seconds]
    ↓
Validate token with server
    ↓
Check inactivity duration
    ↓
[Inactivity < 25 minutes]
    ↓
Continue monitoring
    ↓
[Inactivity 25-30 minutes]
    ↓
Show 5-minute warning modal
    ↓
[User clicks "Continue"]
    ↓
Reset activity timer → Back to monitoring
    ↓
[User clicks "Logout" or timer expires]
    ↓
Clear session data
    ↓
Redirect to home page
```

## Browser Console Output

When session expires, you'll see:

```javascript
// Inactivity timeout
"Session expired due to inactivity"

// Token validation failed
"Token validation failed"

// Auto-logout
"Session expired, logging out..."
```

## Testing

### Test 1: Manual Logout
1. Login to the application
2. Wait 5 minutes without activity
3. Should see warning modal
4. Click "Logout" button
5. Should redirect to home page

### Test 2: Session Extension
1. Login to the application
2. Wait 5 minutes without activity
3. Should see warning modal
4. Click "Continue Session"
5. Modal should disappear
6. Session should extend 30 more minutes

### Test 3: Activity Reset
1. Login to the application
2. Wait 5 minutes without activity
3. Should see warning modal
4. Move mouse or press keyboard
5. Modal should disappear (activity detected)
6. Timer should reset

### Test 4: Token Expiration
1. Login to the application
2. Check browser DevTools Network tab
3. Look for `/api/auth/validate` requests every 60 seconds
4. Verify token is being validated

## Security Considerations

✅ **Server-side Validation** - Token always validated with server  
✅ **Inactivity Protection** - Prevents unauthorized access during breaks  
✅ **Token Cleanup** - All auth tokens removed on logout  
✅ **Activity Tracking** - Detects all user interactions  
✅ **Graceful Degradation** - Network errors don't auto-logout  

## Troubleshooting

### Session expires too quickly
- Check `SESSION_TIMEOUT` value in `sessionManager.ts`
- Verify activity events are being triggered (check console)

### Warning modal doesn't appear
- Check browser console for errors
- Verify SessionListener is imported in `layout.tsx`
- Ensure token exists in localStorage

### User not logging out at timeout
- Check `onSessionExpire` callback is properly called
- Verify `Logout()` function is working
- Check browser console for errors

### Token validation always fails
- Verify `/api/auth/validate` endpoint exists
- Check Supabase credentials in `.env`
- Ensure token format is correct

## Files Created/Modified

### New Files:
- `app/api/auth/verification/sessionManager.ts` - Core session management
- `app/api/auth/verification/SessionListener.tsx` - React component for monitoring
- `app/api/auth/validate/route.ts` - Token validation endpoint
- `app/api/auth/refresh/route.ts` - Token refresh endpoint

### Modified Files:
- `app/layout.tsx` - Added SessionListener component
- `app/provider/UserIdProvider.tsx` - Added session validation on load

## Next Steps

1. ✅ Test all authentication flows
2. ✅ Verify session timeout works
3. ✅ Test token validation API
4. ✅ Test warning modal UI/UX
5. Consider adding analytics to track session timeouts
6. Consider adding session resumption on tab focus

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Web Activity Detection](https://developer.mozilla.org/en-US/docs/Web/API/Document/addEventListener)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

# Google OAuth Implementation Setup Guide

## Overview
This guide explains the Google OAuth authentication implementation that has been added to your backend.

## What Has Been Implemented

### 1. Dependencies Added
- `google-auth-library` - For Google ID token verification

### 2. Files Modified/Created

#### New Files:
- `middleware/google-auth.js` - Google OAuth token verification middleware

#### Modified Files:
- `models/user-model.js` - Added Google OAuth fields
- `controllers/auth-controller.js` - Updated with secure Google authentication
- `routes/auth-routes.js` - Added Google registration route
- `index.js` - Updated CORS configuration
- `env.example` - Added Google OAuth environment variables

### 3. Database Schema Updates

The User model now includes:
```javascript
googleId: { type: String }, // Google's unique user ID
emailVerified: { type: Boolean, default: false },
authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
imageUrl: { type: String } // Google profile picture URL
```

### 4. New API Endpoints

#### POST /auth/login-google
**Purpose**: Secure Google OAuth login/registration
**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "User Name", 
  "imageUrl": "https://profile-pic-url",
  "idToken": "google-id-token-here"
}
```

#### POST /auth/register-google
**Purpose**: Google OAuth registration with additional user data
**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "imageUrl": "https://profile-pic-url", 
  "idToken": "google-id-token-here",
  "role": "COACH",
  "project": "Project Name",
  "detailsOfProject": "Project Details"
}
```

### 5. Security Features

- **ID Token Verification**: All Google tokens are verified against Google's servers
- **Email Matching**: Ensures the email in the token matches the request
- **CORS Protection**: Configured for specific origins only
- **Auto User Creation**: Creates users automatically on first Google login
- **Status Management**: Google users are automatically activated

## Environment Configuration

Add to your `.env` file:
```bash
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

## Key Security Improvements

1. **Token Verification**: Every Google ID token is verified server-side
2. **Email Consistency**: Prevents token/email mismatches
3. **Secure User Creation**: Automatic user creation with proper validation
4. **Provider Tracking**: Tracks authentication method (local vs Google)
5. **Enhanced CORS**: Restricts requests to specific origins

## Frontend Integration

The backend now expects:
- `idToken` - Google's ID token for verification
- `email` - User's email (must match token)
- `name` - User's full name
- `imageUrl` - User's profile picture

## Testing

To test the implementation:
1. Set up your Google Client ID in environment variables
2. Test with valid Google ID tokens
3. Verify user creation and login flows
4. Test error handling with invalid tokens

## Migration Notes

- Existing users are unaffected
- Mobile field is now optional (for Google users)
- Password is optional (for Google users)
- All Google users are auto-activated

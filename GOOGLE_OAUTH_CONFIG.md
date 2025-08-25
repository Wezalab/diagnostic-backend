# Google OAuth Configuration

## Your Google OAuth Credentials

Based on the credentials you provided, here are the configuration values for your `.env` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=xxxxxxxxxxxx
```

## Complete .env File Template

Create or update your `.env` file with the following content:

```bash
# Environment Configuration
NODE_ENV=development
PORT=4000

# Database Configuration
url=mongodb://localhost:27017/diagnostic_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
SECRET_KEY=your_secret_key_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=xxxxxxxxxxxx

# Email Configuration (SMTP)
SMTP_HOST=
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
BASE_URL=http://46.202.168.1:4000

# Twilio Configuration (if using SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Other API Keys
# Add any other environment variables your application needs
```

## Setup Instructions

1. **Create the .env file**:
   ```bash
   cp env.example .env
   ```

2. **Update the GOOGLE_CLIENT_ID** in your `.env` file with:
   ```
   GOOGLE_CLIENT_ID=xxxxxxxxxxxx
   ```

3. **Set your JWT secrets** (replace with strong random strings):
   ```bash
   JWT_SECRET=your_strong_jwt_secret_here
   SECRET_KEY=your_strong_secret_key_here
   ```

## Verified Configuration Details

From your Google OAuth setup:
- **Project ID**: coaching-421922
- **Client ID**: xxxxxxxxxxxx
- **Authorized JavaScript Origins**: 
  - http://localhost:3000
  - https://alphanew.coach
- **Authorized Redirect URIs**:
  - http://localhost:3000/auth/google/callback  
  - https://alphanew.coach/auth/google/callback

## Security Notes

⚠️ **Important**: Never commit your `.env` file to version control. It's already in `.gitignore` for security.

The implementation is ready to use with your Google OAuth credentials!

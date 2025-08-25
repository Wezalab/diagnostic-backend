# Gmail SMTP Setup Guide

## Step-by-Step Gmail Configuration

### 1. Enable 2-Factor Authentication (Required)

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2FA (you'll need your phone)

### 2. Generate App Password

1. After enabling 2FA, go back to **Security** settings
2. Under "Signing in to Google", click **2-Step Verification**
3. Scroll down and click **App passwords**
4. Select **Mail** from the dropdown
5. Click **Generate**
6. **Copy the 16-character password** (you'll need this for SMTP_PASS)

### 3. Configure Environment Variables

Add these to your `.env` file:

```bash
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-gmail@gmail.com
```

### 4. Example Configuration

If your Gmail is `john.doe@gmail.com` and your app password is `abcd efgh ijkl mnop`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=john.doe@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=john.doe@gmail.com
```

⚠️ **Important**: Use the app password (16 characters), NOT your regular Gmail password!

## Alternative: Less Secure Apps (Not Recommended)

If you can't use App Passwords, you can enable "Less secure app access":

1. Go to [Less secure app access](https://myaccount.google.com/lesssecureapps)
2. Turn on **Allow less secure apps**
3. Use your regular Gmail password in SMTP_PASS

⚠️ **Security Warning**: This method is less secure and may be disabled by Google.

## Testing Your Configuration

### Option 1: Use the Test Script
```bash
./test-email.sh
```

### Option 2: Use curl
```bash
curl -X POST http://localhost:4000/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recipient@example.com",
    "name": "Test User"
  }'
```

### Option 3: Use Postman
- **Method**: POST
- **URL**: `http://localhost:4000/auth/test-email`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "recipient@example.com",
  "name": "Test User"
}
```

## Common Issues & Solutions

### Issue 1: "Invalid login" error
**Solution**: Make sure you're using the App Password, not your regular password

### Issue 2: "Less secure apps" error
**Solution**: Enable 2FA and use App Password instead

### Issue 3: "Authentication failed"
**Solution**: 
- Double-check your Gmail address
- Verify the App Password is correct (no spaces)
- Make sure 2FA is enabled

### Issue 4: Emails going to Spam
**Solution**: 
- This is normal for development testing
- Recipients should check their spam folder
- For production, use a proper domain email

## Production Recommendations

For production applications, consider:
- **SendGrid** - Professional email service
- **Mailgun** - Developer-friendly email API
- **AWS SES** - Amazon's email service
- **Domain Email** - Use your own domain (e.g., noreply@yourdomain.com)

Gmail is perfect for development and testing, but not recommended for production due to sending limits.

## Gmail Sending Limits

- **Daily limit**: 500 emails per day
- **Rate limit**: 100 emails per hour
- **Attachment size**: 25MB max

For higher volumes, use dedicated email services.

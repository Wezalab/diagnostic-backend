# Email Configuration & Testing Guide

## Overview
Your backend has email functionality configured with nodemailer using SMTP. This guide will help you configure and test email sending.

## Required Environment Variables

Add these to your `.env` file:

```bash
# Email Configuration (SMTP)
SMTP_HOST=your-smtp-server.com
SMTP_PORT=465
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
SMTP_FROM=noreply@yourdomain.com
```

## Common SMTP Configurations

### Gmail (for testing)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password  # Use App Password, not regular password
SMTP_FROM=your-gmail@gmail.com
```

### cPanel Hosting
```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-email-password
SMTP_FROM=noreply@yourdomain.com
```

### Office 365
```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
SMTP_FROM=your-email@yourdomain.com
```

## Testing Email Functionality

I've created a test endpoint for you to verify email configuration:

### POST `/auth/test-email`

**Request Body:**
```json
{
  "email": "recipient@example.com",
  "name": "Test User"
}
```

**Success Response:**
```json
{
  "message": "Email de test envoyé avec succès",
  "details": {
    "recipient": "recipient@example.com",
    "messageId": "message-id-from-smtp",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "smtp_host": "smtp.gmail.com",
    "smtp_port": "465"
  }
}
```

**Error Response:**
```json
{
  "message": "Erreur d'authentification SMTP",
  "error": "Vérifiez vos identifiants SMTP_USER et SMTP_PASS",
  "smtp_config": {
    "host": "smtp.gmail.com",
    "port": "465",
    "user": "configuré",
    "pass": "configuré",
    "from": "configuré"
  }
}
```

## Testing Commands

### Using curl:
```bash
curl -X POST http://46.202.168.1:4000/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@example.com",
    "name": "Test User"
  }'
```

### Using Postman:
1. **Method**: POST
2. **URL**: `http://46.202.168.1:4000/auth/test-email`
3. **Headers**: `Content-Type: application/json`
4. **Body (raw JSON)**:
   ```json
   {
     "email": "your-test-email@example.com",
     "name": "Test User"
   }
   ```

## Existing Email Features

Your backend already sends emails for:

1. **Welcome Email** - Sent when users register
2. **Password Reset Email** - Sent when users request password reset
3. **Password Reset Code** - Sent with reset codes
4. **Google Registration** - Sent when users register via Google OAuth

## Common Issues & Solutions

### 1. Authentication Error (EAUTH)
**Problem**: Invalid SMTP credentials
**Solution**: 
- Check SMTP_USER and SMTP_PASS
- For Gmail, use App Password instead of regular password
- Enable "Less secure app access" (not recommended for production)

### 2. Connection Error (ECONNECTION)
**Problem**: Can't connect to SMTP server
**Solution**:
- Check SMTP_HOST and SMTP_PORT
- Verify server allows external SMTP connections
- Check firewall settings

### 3. SSL/TLS Errors
**Problem**: SSL certificate issues
**Solution**:
- Use port 465 for SSL or 587 for TLS
- Set `secure: true` for port 465, `secure: false` for port 587

### 4. Email in Spam Folder
**Problem**: Emails going to spam
**Solution**:
- Set up SPF, DKIM, and DMARC records
- Use a domain email instead of Gmail
- Include unsubscribe links

## Gmail Setup (for Development Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Create App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use App Password** in SMTP_PASS (not your regular password)

## Production Recommendations

- Use a dedicated email service (SendGrid, Mailgun, AWS SES)
- Set up proper DNS records (SPF, DKIM, DMARC)
- Use a domain email address
- Monitor email delivery rates
- Implement email templates

## Security Best Practices

- Never commit `.env` file to version control
- Use strong passwords for email accounts
- Enable 2FA on email accounts
- Regularly rotate email passwords
- Monitor for unusual email activity

#!/bin/bash

# Gmail SMTP Setup Script
echo "📧 Gmail SMTP Configuration Helper"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📁 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created"
else
    echo "📁 .env file already exists"
fi

echo ""
echo "🔧 Gmail SMTP Configuration"
echo ""

# Get Gmail address
read -p "Enter your Gmail address (e.g., john.doe@gmail.com): " GMAIL_ADDRESS

if [ -z "$GMAIL_ADDRESS" ]; then
    echo "❌ Gmail address is required"
    exit 1
fi

echo ""
echo "🔐 App Password Setup"
echo "Before continuing, you need to:"
echo "1. Enable 2-Factor Authentication on your Google account"
echo "2. Generate an App Password for Mail"
echo ""
echo "📖 Detailed instructions:"
echo "1. Go to: https://myaccount.google.com/security"
echo "2. Click '2-Step Verification' and enable it"
echo "3. Go back to Security → 2-Step Verification → App passwords"
echo "4. Select 'Mail' and generate password"
echo "5. Copy the 16-character password (remove spaces)"
echo ""

read -p "Have you generated an App Password? (y/n): " APP_PASSWORD_READY

if [ "$APP_PASSWORD_READY" != "y" ] && [ "$APP_PASSWORD_READY" != "Y" ]; then
    echo ""
    echo "⏸️  Please set up your App Password first, then run this script again."
    echo "💡 Run: ./setup-gmail.sh"
    exit 0
fi

echo ""
read -p "Enter your Gmail App Password (16 characters, no spaces): " APP_PASSWORD

if [ -z "$APP_PASSWORD" ]; then
    echo "❌ App Password is required"
    exit 1
fi

# Remove spaces from app password
APP_PASSWORD=$(echo "$APP_PASSWORD" | tr -d ' ')

echo ""
echo "📝 Updating .env file..."

# Update or add Gmail SMTP configuration
if grep -q "SMTP_HOST=" .env; then
    # Update existing entries
    sed -i '' "s/SMTP_HOST=.*/SMTP_HOST=smtp.gmail.com/" .env
    sed -i '' "s/SMTP_PORT=.*/SMTP_PORT=465/" .env
    sed -i '' "s/SMTP_USER=.*/SMTP_USER=$GMAIL_ADDRESS/" .env
    sed -i '' "s/SMTP_PASS=.*/SMTP_PASS=$APP_PASSWORD/" .env
    sed -i '' "s/SMTP_FROM=.*/SMTP_FROM=$GMAIL_ADDRESS/" .env
else
    # Add new entries
    echo "" >> .env
    echo "# Gmail SMTP Configuration" >> .env
    echo "SMTP_HOST=smtp.gmail.com" >> .env
    echo "SMTP_PORT=465" >> .env
    echo "SMTP_USER=$GMAIL_ADDRESS" >> .env
    echo "SMTP_PASS=$APP_PASSWORD" >> .env
    echo "SMTP_FROM=$GMAIL_ADDRESS" >> .env
fi

echo "✅ Gmail SMTP configuration updated in .env"
echo ""

echo "🧪 Testing Configuration"
echo "========================"
echo "Your Gmail SMTP is now configured with:"
echo "📧 Email: $GMAIL_ADDRESS"
echo "🔧 SMTP Host: smtp.gmail.com"
echo "🔌 Port: 465 (SSL)"
echo ""

# Test the configuration
echo "🚀 Would you like to test the email configuration now?"
read -p "Enter a test email address (or press Enter to skip): " TEST_EMAIL

if [ ! -z "$TEST_EMAIL" ]; then
    echo ""
    echo "📤 Testing email to: $TEST_EMAIL"
    echo "Make sure your server is running (npm start in another terminal)"
    echo ""
    
    # Check if server is running
    if curl -s http://localhost:4000/test > /dev/null 2>&1; then
        echo "✅ Server is running, sending test email..."
        
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:4000/auth/test-email \
          -H "Content-Type: application/json" \
          -d "{
            \"email\": \"$TEST_EMAIL\",
            \"name\": \"Gmail Test User\"
          }")
        
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        BODY=$(echo "$RESPONSE" | head -n -1)
        
        if [ "$HTTP_CODE" -eq 200 ]; then
            echo "✅ Test email sent successfully!"
            echo "📬 Check the inbox at: $TEST_EMAIL"
            echo "💡 Note: Gmail emails might go to spam folder initially"
        else
            echo "❌ Failed to send test email"
            echo "Response: $BODY"
        fi
    else
        echo "❌ Server is not running on port 4000"
        echo "💡 Start your server with: npm start"
        echo "💡 Then run: ./test-email.sh"
    fi
else
    echo "⏭️  Test skipped"
    echo "💡 To test later, run: ./test-email.sh"
fi

echo ""
echo "🎉 Gmail SMTP Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start your server: npm start"
echo "2. Test emails: ./test-email.sh"
echo "3. Check Gmail inbox/spam folder"
echo ""
echo "📖 For troubleshooting, see: GMAIL_SETUP.md"

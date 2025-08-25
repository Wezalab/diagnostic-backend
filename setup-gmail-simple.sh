#!/bin/bash

# Simplified Gmail Setup (with Less Secure Apps option)
echo "📧 Gmail SMTP Quick Setup"
echo "========================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📁 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created"
fi

echo ""
echo "🔧 Gmail Configuration Options"
echo ""
echo "Choose your setup method:"
echo "1) App Password (Recommended - More Secure)"
echo "2) Less Secure Apps (Quick Setup - For Testing Only)"
echo ""

read -p "Enter your choice (1 or 2): " SETUP_METHOD

# Get Gmail address
echo ""
read -p "Enter your Gmail address: " GMAIL_ADDRESS

if [ -z "$GMAIL_ADDRESS" ]; then
    echo "❌ Gmail address is required"
    exit 1
fi

if [ "$SETUP_METHOD" = "1" ]; then
    echo ""
    echo "🔐 App Password Setup"
    echo "===================="
    echo ""
    echo "📋 Steps to get App Password:"
    echo "1. Go to: https://myaccount.google.com/apppasswords"
    echo "2. Sign in to your Google account"
    echo "3. If you don't see the page, make sure 2FA is enabled"
    echo "4. Select 'Mail' or 'Other' and enter 'Backend API'"
    echo "5. Copy the 16-character password"
    echo ""
    echo "🔗 Direct link: https://myaccount.google.com/apppasswords"
    echo ""
    
    read -p "Have you generated the App Password? (y/n): " APP_READY
    
    if [ "$APP_READY" != "y" ] && [ "$APP_READY" != "Y" ]; then
        echo ""
        echo "⏸️  Please generate your App Password first, then run this script again."
        exit 0
    fi
    
    echo ""
    read -p "Enter your App Password (16 characters): " GMAIL_PASSWORD
    GMAIL_PASSWORD=$(echo "$GMAIL_PASSWORD" | tr -d ' ')
    
elif [ "$SETUP_METHOD" = "2" ]; then
    echo ""
    echo "⚠️  Less Secure Apps Setup"
    echo "=========================="
    echo ""
    echo "📋 Steps to enable Less Secure Apps:"
    echo "1. Go to: https://myaccount.google.com/lesssecureapps"
    echo "2. Turn ON 'Allow less secure apps'"
    echo "3. Use your regular Gmail password"
    echo ""
    echo "🔗 Direct link: https://myaccount.google.com/lesssecureapps"
    echo ""
    
    read -p "Have you enabled Less Secure Apps? (y/n): " LESS_SECURE_READY
    
    if [ "$LESS_SECURE_READY" != "y" ] && [ "$LESS_SECURE_READY" != "Y" ]; then
        echo ""
        echo "⏸️  Please enable Less Secure Apps first, then run this script again."
        exit 0
    fi
    
    echo ""
    read -s -p "Enter your Gmail password: " GMAIL_PASSWORD
    echo ""
    
else
    echo "❌ Invalid choice. Please run the script again."
    exit 1
fi

if [ -z "$GMAIL_PASSWORD" ]; then
    echo "❌ Password is required"
    exit 1
fi

echo ""
echo "📝 Updating .env file..."

# Update Gmail configuration in .env
if grep -q "SMTP_HOST=" .env; then
    sed -i '' "s/SMTP_HOST=.*/SMTP_HOST=smtp.gmail.com/" .env
    sed -i '' "s/SMTP_PORT=.*/SMTP_PORT=465/" .env
    sed -i '' "s/SMTP_USER=.*/SMTP_USER=$GMAIL_ADDRESS/" .env
    sed -i '' "s/SMTP_PASS=.*/SMTP_PASS=$GMAIL_PASSWORD/" .env
    sed -i '' "s/SMTP_FROM=.*/SMTP_FROM=$GMAIL_ADDRESS/" .env
else
    echo "" >> .env
    echo "# Gmail SMTP Configuration" >> .env
    echo "SMTP_HOST=smtp.gmail.com" >> .env
    echo "SMTP_PORT=465" >> .env
    echo "SMTP_USER=$GMAIL_ADDRESS" >> .env
    echo "SMTP_PASS=$GMAIL_PASSWORD" >> .env
    echo "SMTP_FROM=$GMAIL_ADDRESS" >> .env
fi

echo "✅ Gmail SMTP configuration saved"
echo ""

# Test option
echo "🧪 Test Configuration"
echo "===================="
read -p "Enter email address to test (or press Enter to skip): " TEST_EMAIL

if [ ! -z "$TEST_EMAIL" ]; then
    echo ""
    echo "📤 Testing email to: $TEST_EMAIL"
    
    if curl -s http://localhost:4000/test > /dev/null 2>&1; then
        echo "✅ Server detected, sending test email..."
        
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:4000/auth/test-email \
          -H "Content-Type: application/json" \
          -d "{
            \"email\": \"$TEST_EMAIL\",
            \"name\": \"Gmail Test\"
          }")
        
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        
        if [ "$HTTP_CODE" -eq 200 ]; then
            echo "✅ Test email sent successfully!"
            echo "📬 Check inbox at: $TEST_EMAIL"
        else
            echo "❌ Test failed. Response code: $HTTP_CODE"
        fi
    else
        echo "⚠️  Server not running. Start with: npm start"
        echo "💡 Then test with: ./test-email.sh"
    fi
else
    echo "⏭️  Test skipped"
fi

echo ""
echo "🎉 Gmail Setup Complete!"
echo ""
echo "📋 Configuration Summary:"
echo "📧 Email: $GMAIL_ADDRESS"
echo "🔧 Method: $([ "$SETUP_METHOD" = "1" ] && echo "App Password" || echo "Less Secure Apps")"
echo ""
echo "💡 Next steps:"
echo "1. Start server: npm start"
echo "2. Test emails: ./test-email.sh"
echo ""
if [ "$SETUP_METHOD" = "2" ]; then
    echo "⚠️  Remember: Disable 'Less Secure Apps' when done testing"
    echo "🔐 For production, use App Passwords or dedicated email service"
fi

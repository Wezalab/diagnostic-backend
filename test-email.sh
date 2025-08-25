#!/bin/bash

# Email Test Script
# This script tests the email functionality of your backend

echo "🧪 Testing Email Functionality"
echo "================================"

# Check if server is running
echo "📡 Checking if server is running..."
if curl -s http://localhost:4000/test > /dev/null; then
    echo "✅ Server is running on port 4000"
else
    echo "❌ Server is not running on port 4000"
    echo "💡 Start your server with: npm start"
    exit 1
fi

echo ""
echo "📧 Testing email endpoint..."
echo "Enter the email address to send test email to:"
read -p "Email: " TEST_EMAIL

if [ -z "$TEST_EMAIL" ]; then
    echo "❌ Email address is required"
    exit 1
fi

echo ""
echo "📤 Sending test email to: $TEST_EMAIL"

# Send test email
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:4000/auth/test-email \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"name\": \"Test User\"
  }")

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
# Extract response body (all lines except last)
BODY=$(echo "$RESPONSE" | head -n -1)

echo ""
echo "📋 Response Details:"
echo "HTTP Status: $HTTP_CODE"
echo "Response Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

if [ "$HTTP_CODE" -eq 200 ]; then
    echo ""
    echo "✅ Test email sent successfully!"
    echo "📬 Check your inbox at: $TEST_EMAIL"
else
    echo ""
    echo "❌ Failed to send test email"
    echo "💡 Check your SMTP configuration in .env file"
fi

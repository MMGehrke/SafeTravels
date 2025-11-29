#!/bin/bash

# Test script for the /api/ai-advisor endpoint
# Make sure the server is running first: npm run dev

BASE_URL="http://localhost:3000"

echo "🤖 Testing AI Advisor Endpoint with Anonymization"
echo "=================================================="
echo ""

# Test 1: Request with email and phone number
echo "✅ Test 1: Request with personal information"
echo "Request body contains:"
echo "  - Email: user@example.com"
echo "  - Phone: 123-456-7890"
echo ""
curl -X POST "$BASE_URL/api/ai-advisor" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Is it safe to travel to Brazil as an LGBTQIA+ person?",
    "userEmail": "user@example.com",
    "phoneNumber": "123-456-7890",
    "destination": "Brazil"
  }' \
  | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

# Test 2: Request with multiple emails
echo "✅ Test 2: Request with multiple emails"
curl -X POST "$BASE_URL/api/ai-advisor" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the safest countries for LGBTQIA+ travelers?",
    "primaryEmail": "primary@example.com",
    "secondaryEmail": "secondary@example.org",
    "contactPhone": "+1-555-123-4567"
  }' \
  | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

# Test 3: Request with various phone formats
echo "✅ Test 3: Request with various phone number formats"
curl -X POST "$BASE_URL/api/ai-advisor" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Safety tips for traveling?",
    "phone1": "(123) 456-7890",
    "phone2": "123-456-7890",
    "phone3": "123.456.7890",
    "phone4": "+1 123 456 7890",
    "phone5": "1234567890"
  }' \
  | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

# Test 4: Request without personal info (should work normally)
echo "✅ Test 4: Request without personal information"
curl -X POST "$BASE_URL/api/ai-advisor" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What should I know about traveling to Canada?",
    "destination": "Canada"
  }' \
  | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

echo "✨ Testing complete!"
echo ""
echo "📋 Check your server console to see:"
echo "   - BEFORE anonymization (original data)"
echo "   - Found emails/phones"
echo "   - AFTER anonymization (redacted data)"
echo ""
echo "Note: Install 'jq' for prettier JSON output: brew install jq"

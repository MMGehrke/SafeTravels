#!/bin/bash

# Test script for rate limiting on /api/ai-advisor endpoint
# Make sure the server is running first: npm run dev

BASE_URL="http://localhost:3000"

echo "🛡️  Testing Rate Limiting on AI Advisor Endpoint"
echo "=================================================="
echo ""
echo "Rate Limit: 5 requests per 15 minutes per IP"
echo ""

# Test 1: Make 5 requests (should all succeed)
echo "✅ Test 1: Making 5 requests (within limit)"
echo "--------------------------------------------"
for i in {1..5}; do
  echo "Request $i:"
  response=$(curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$BASE_URL/api/ai-advisor" \
    -H "Content-Type: application/json" \
    -d "{\"question\": \"Test question $i\", \"destination\": \"Test\"}")
  
  http_code=$(echo "$response" | grep "HTTP Status" | awk '{print $3}')
  if [ "$http_code" = "200" ]; then
    echo "  ✅ Success (HTTP 200)"
  elif [ "$http_code" = "429" ]; then
    echo "  ❌ Rate Limited (HTTP 429)"
  else
    echo "  ⚠️  Unexpected status: $http_code"
  fi
  echo ""
  sleep 0.5
done

# Test 2: Make 6th request (should fail with 429)
echo ""
echo "❌ Test 2: Making 6th request (should exceed limit)"
echo "---------------------------------------------------"
response=$(curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$BASE_URL/api/ai-advisor" \
  -H "Content-Type: application/json" \
  -d '{"question": "This should be rate limited", "destination": "Test"}')

http_code=$(echo "$response" | grep "HTTP Status" | awk '{print $3}')
if [ "$http_code" = "429" ]; then
  echo "  ✅ Correctly rate limited (HTTP 429)"
  echo ""
  echo "Response body:"
  echo "$response" | grep -v "HTTP Status" | jq '.' 2>/dev/null || echo "$response" | grep -v "HTTP Status"
else
  echo "  ⚠️  Expected HTTP 429, got: $http_code"
fi
echo ""

# Test 3: Check rate limit headers
echo ""
echo "📊 Test 3: Checking rate limit headers"
echo "--------------------------------------"
response=$(curl -s -i -X POST "$BASE_URL/api/ai-advisor" \
  -H "Content-Type: application/json" \
  -d '{"question": "Check headers", "destination": "Test"}')

echo "Rate limit headers:"
echo "$response" | grep -i "ratelimit" || echo "  (No rate limit headers found - might be rate limited)"
echo ""

# Test 4: Wait and retry (if you want to test reset)
echo ""
echo "⏳ Test 4: Rate limit information"
echo "----------------------------------"
echo "To test rate limit reset:"
echo "  1. Wait 15 minutes"
echo "  2. Run this script again"
echo "  3. First 5 requests should succeed"
echo ""
echo "Current rate limit status:"
echo "  - Limit: 5 requests"
echo "  - Window: 15 minutes"
echo "  - Your IP has used: Check headers above"
echo ""

echo "✨ Testing complete!"
echo ""
echo "Note: Install 'jq' for prettier JSON output: brew install jq"

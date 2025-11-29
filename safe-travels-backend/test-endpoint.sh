#!/bin/bash

# Test script for the /api/check-safety endpoint
# Make sure the server is running first: npm run dev

BASE_URL="http://localhost:3000"

echo "🧪 Testing Galois API Endpoints"
echo "===================================="
echo ""

# Test 1: Valid request
echo "✅ Test 1: Valid coordinates (Toronto, Canada)"
curl -X POST "$BASE_URL/api/check-safety" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 43.6532, "longitude": -79.3832}' \
  | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

# Test 2: Missing latitude
echo "❌ Test 2: Missing latitude (should return 400)"
curl -X POST "$BASE_URL/api/check-safety" \
  -H "Content-Type: application/json" \
  -d '{"longitude": -79.3832}' \
  | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

# Test 3: Invalid latitude (out of range)
echo "❌ Test 3: Invalid latitude - out of range (should return 400)"
curl -X POST "$BASE_URL/api/check-safety" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 999, "longitude": -79.3832}' \
  | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

# Test 4: Invalid type (string instead of number)
echo "❌ Test 4: Invalid type - string instead of number (should return 400)"
curl -X POST "$BASE_URL/api/check-safety" \
  -H "Content-Type: application/json" \
  -d '{"latitude": "not a number", "longitude": -79.3832}' \
  | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

# Test 5: Missing longitude
echo "❌ Test 5: Missing longitude (should return 400)"
curl -X POST "$BASE_URL/api/check-safety" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 43.6532}' \
  | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

echo "✨ Testing complete!"
echo ""
echo "Note: Install 'jq' for prettier JSON output: brew install jq"


#!/bin/bash

# Test script for the /api/path-risk endpoint
# Make sure the server is running first: npm run dev

BASE_URL="http://localhost:3000"

echo "🗺️  Testing Safe Pathfinding Endpoint"
echo "======================================"
echo ""

# Test 1: Safe route (Toronto area - no danger zones nearby)
echo "✅ Test 1: Safe route through Toronto (no danger zones)"
echo "Route: 3 points in Toronto, Canada"
echo ""
curl -X POST "$BASE_URL/api/path-risk" \
  -H "Content-Type: application/json" \
  -d '{
    "route": [
      { "lat": 43.6532, "lon": -79.3832 },
      { "lat": 43.6510, "lon": -79.3800 },
      { "lat": 43.6488, "lon": -79.3768 }
    ]
  }' \
  | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

# Test 2: Route near danger zone (Kampala, Uganda)
echo "⚠️  Test 2: Route near danger zone (Kampala, Uganda)"
echo "Route: 3 points near Kampala danger zone"
echo ""
curl -X POST "$BASE_URL/api/path-risk" \
  -H "Content-Type: application/json" \
  -d '{
    "route": [
      { "lat": 0.3476, "lon": 32.5825 },
      { "lat": 0.3500, "lon": 32.5850 },
      { "lat": 0.3450, "lon": 32.5800 }
    ],
    "dangerThresholdKm": 0.5
  }' \
  | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

# Test 3: Route through Moscow danger zone
echo "⚠️  Test 3: Route through Moscow danger zone"
echo "Route: 4 points in Moscow, Russia"
echo ""
curl -X POST "$BASE_URL/api/path-risk" \
  -H "Content-Type: application/json" \
  -d '{
    "route": [
      { "lat": 55.7558, "lon": 37.6173 },
      { "lat": 55.7520, "lon": 37.6156 },
      { "lat": 55.7500, "lon": 37.6200 },
      { "lat": 55.7480, "lon": 37.6220 }
    ]
  }' \
  | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

# Test 4: Mixed route (some safe, some risky)
echo "🔄 Test 4: Mixed route (safe and risky areas)"
echo "Route: From safe area to risky area"
echo ""
curl -X POST "$BASE_URL/api/path-risk" \
  -H "Content-Type: application/json" \
  -d '{
    "route": [
      { "lat": 43.6532, "lon": -79.3832 },
      { "lat": 45.5017, "lon": -73.5673 },
      { "lat": 0.3476, "lon": 32.5825 }
    ]
  }' \
  | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

# Test 5: Long route with custom threshold
echo "📏 Test 5: Long route with custom danger threshold (1.0 km)"
echo "Route: 5 points with larger threshold"
echo ""
curl -X POST "$BASE_URL/api/path-risk" \
  -H "Content-Type: application/json" \
  -d '{
    "route": [
      { "lat": 0.3400, "lon": 32.5700 },
      { "lat": 0.3450, "lon": 32.5750 },
      { "lat": 0.3500, "lon": 32.5800 },
      { "lat": 0.3550, "lon": 32.5850 },
      { "lat": 0.3600, "lon": 32.5900 }
    ],
    "dangerThresholdKm": 1.0
  }' \
  | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

# Test 6: Invalid route (should return validation error)
echo "❌ Test 6: Invalid route (should return 400 error)"
echo "Route: Missing longitude"
echo ""
curl -X POST "$BASE_URL/api/path-risk" \
  -H "Content-Type: application/json" \
  -d '{
    "route": [
      { "lat": 43.6532 },
      { "lat": 43.6510, "lon": -79.3800 }
    ]
  }' \
  | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

echo "✨ Testing complete!"
echo ""
echo "📊 Expected Results:"
echo "   - Test 1: High safety score (80-100), no flagged points"
echo "   - Test 2: Low safety score (0-40), flagged points near Kampala"
echo "   - Test 3: Low safety score, flagged points in Moscow"
echo "   - Test 4: Medium safety score, some flagged points"
echo "   - Test 5: More flagged points due to larger threshold"
echo "   - Test 6: Validation error (400)"
echo ""
echo "Note: Install 'jq' for prettier JSON output: brew install jq"

# Galois Testing Guide

Complete guide to testing all features of the Galois application.

---

## 🚀 Quick Start Testing

### Prerequisites

1. **Node.js** installed (v14 or higher)
2. **Expo CLI** installed globally:
   ```bash
   npm install -g @expo/cli
   ```
3. **iOS Simulator** (Mac) or **Android Emulator** (or physical device with Expo Go app)

---

## 📋 Step-by-Step Testing

### Step 1: Install Dependencies

**Frontend:**
```bash
cd /Users/macoygehrke/SafeTravels
npm install
```

**Backend:**
```bash
cd safe-travels-backend
npm install
```

### Step 2: Start the Backend Server

**Terminal 1 - Backend:**
```bash
cd safe-travels-backend
npm run dev
```

**Expected Output:**
```
╔════════════════════════════════════════╗
║   SafeTravels Backend Server          ║
║   🚀 Server running on port 3000      ║
║   🌍 Environment: development         ║
║   📍 Health check: http://localhost:3000/health ║
╚════════════════════════════════════════╝
```

**Verify Backend is Running:**
```bash
# In a new terminal, test the health endpoint
curl http://localhost:3000/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T..."
}
```

### Step 3: Start the React Native App

**Terminal 2 - Frontend:**
```bash
cd /Users/macoygehrke/SafeTravels
npm start
```

**Expected Output:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

**Choose Your Platform:**
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your phone

---

## 🧪 Testing Each Feature

### 1. Login Page

**What to Test:**
- ✅ Rainbow gradient "Safe Travels" title displays
- ✅ Username and password input fields
- ✅ Server status indicator at bottom
- ✅ Login button functionality

**Steps:**
1. App opens to Login screen
2. Check server status at bottom:
   - 🟢 Green dot = Server connected
   - 🔴 Red dot = Server offline
3. Enter any username and password
4. Tap "Login" button
5. Should navigate to Home screen after ~1.5 seconds

**Expected Behavior:**
- Server status shows "Server connected (development)"
- API URL visible in dev mode (e.g., `http://10.0.2.2:3000` for Android)
- Login works with any credentials (mock authentication)

---

### 2. Home Screen - Interactive Globe

**What to Test:**
- ✅ Interactive globe with country markers
- ✅ Search functionality
- ✅ Country selection (tap or search)
- ✅ Country detail modal

**Steps:**
1. After login, you should see the Home screen
2. **Test Globe Interaction:**
   - Try panning/dragging the globe
   - Tap on country markers (colored circles)
   - Countries: Canada, Uganda, Brazil, Russia, etc.
3. **Test Search:**
   - Type in search bar: "Canada"
   - Should show dropdown with matching countries
   - Tap a country from results
4. **Test Country Selection:**
   - Either tap a country marker OR select from search
   - Should show loading indicator
   - Country detail modal should open

**Expected Behavior:**
- Globe is interactive (can pan)
- Country markers are tappable
- Search filters countries in real-time
- Modal opens with country details

---

### 3. Country Detail Modal

**What to Test:**
- ✅ Two tabs: "Safety Rating" and "News"
- ✅ Safety rating with color coding
- ✅ News stories list
- ✅ Close button

**Steps:**
1. Select a country (Canada, Uganda, Brazil, or Russia)
2. **Safety Rating Tab:**
   - Should show safety rating (Safe/Dangerous/Varies/Avoid)
   - Color-coded badge (Green/Red/Yellow/Orange)
   - Description and key points
3. **News Tab:**
   - Tap "News" tab
   - Should show list of news stories
   - Each story has: Title, Snippet, Source, Date
4. **Close Modal:**
   - Tap "X" button (top right)
   - Should return to Home screen

**Expected Ratings:**
- Canada: 🟢 Safe (Green)
- Uganda: 🔴 Dangerous (Red)
- Brazil: 🟡 Varies By Location (Yellow)
- Russia: 🟠 Avoid (Orange)

---

### 4. Map Screen - Safe Pathfinding

**What to Test:**
- ✅ Map displays with route
- ✅ Route line color (Green = Safe, Red = Risky)
- ✅ Safety score overlay
- ✅ User location marker

**Steps:**
1. On Home screen, tap "🗺️ Safe Pathfinding" button (bottom-right)
2. Map should load showing:
   - Blue marker: Your location (Toronto)
   - Green marker: Route start
   - Red marker: Route end
   - Colored line: Route path
3. **Check Safety Score:**
   - Look at overlay at bottom
   - Should show safety score (0-100)
   - Line color:
     - 🟢 Green = Safe (score ≥ 70)
     - 🔴 Red = Risky (score < 70)
4. **Route Details:**
   - Safety level (Safe/Moderate/Risky/Dangerous)
   - Route length in km
   - Any risk areas detected

**Expected Behavior:**
- Map loads with route visualization
- Safety score calculated from backend
- Line color changes based on score
- Overlay shows safety information

---

### 5. Emergency Wipe / Panic Button

**What to Test:**
- ✅ Panic button (red FAB with trash icon)
- ✅ Alert confirmation dialog
- ✅ Emergency wipe functionality

**Steps:**
1. On Home screen, find red panic button (🗑️) at bottom-left
2. Tap the panic button
3. **Alert Dialog Should Appear:**
   - Title: "Emergency Wipe"
   - Message explaining what will happen
   - Two buttons: "Cancel" and "Wipe All Data"
4. **Test Cancel:**
   - Tap "Cancel"
   - Dialog closes, nothing happens
5. **Test Wipe:**
   - Tap "Wipe All Data" (red button)
   - Should clear all secure storage
   - Should navigate back to Login screen
   - Backend should receive logout request

**Expected Behavior:**
- Alert dialog appears with confirmation
- Cancel does nothing
- Wipe clears data and returns to login
- Check backend logs for logout request

---

## 🔧 Backend API Testing

### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

**Expected:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T..."
}
```

### Test Check Safety Endpoint

```bash
curl -X POST http://localhost:3000/api/check-safety \
  -H "Content-Type: application/json" \
  -d '{"latitude": 43.6532, "longitude": -79.3832}'
```

**Expected:**
```json
{
  "success": true,
  "coordinates": {"latitude": 43.6532, "longitude": -79.3832},
  "safetyScore": 95,
  "safetyLevel": "Safe",
  ...
}
```

### Test Path Risk Endpoint

```bash
curl -X POST http://localhost:3000/api/path-risk \
  -H "Content-Type: application/json" \
  -d '{
    "route": [
      {"lat": 43.6532, "lon": -79.3832},
      {"lat": 43.6510, "lon": -79.3800}
    ]
  }'
```

**Expected:**
```json
{
  "success": true,
  "safetyScore": 85.5,
  "safetyLevel": "Safe",
  "routeLength": 0.25,
  ...
}
```

### Test AI Advisor Endpoint (with Rate Limiting)

```bash
# First 5 requests should succeed
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/ai-advisor \
    -H "Content-Type: application/json" \
    -d '{"question": "Is Brazil safe?", "userEmail": "test@example.com"}'
  echo ""
done

# 6th request should return HTTP 429 (rate limited)
curl -X POST http://localhost:3000/api/ai-advisor \
  -H "Content-Type: application/json" \
  -d '{"question": "Test"}'
```

**Expected:**
- First 5: HTTP 200 with anonymized data
- 6th: HTTP 429 "Too Many Requests"
- Check server logs for anonymization (emails should be [REDACTED_EMAIL])

---

## 🐛 Troubleshooting

### Backend Won't Start

**Issue:** Port 3000 already in use
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process or change PORT in .env
```

**Solution:**
```bash
# Option 1: Change port
cd safe-travels-backend
echo "PORT=3001" >> .env

# Option 2: Kill existing process
kill -9 <PID>
```

### Frontend Can't Connect to Backend

**Issue:** "Unable to connect to server"

**Check:**
1. Backend is running (`npm run dev` in backend folder)
2. Correct API URL:
   - iOS Simulator: `http://localhost:3000`
   - Android Emulator: `http://10.0.2.2:3000`
   - Physical device: Your computer's IP (e.g., `http://192.168.1.100:3000`)

**Solution:**
- Check server status on Login screen
- Verify API_BASE_URL in console logs
- Ensure backend is accessible from your network

### Map Not Displaying

**Issue:** Map screen is blank

**Check:**
1. react-native-maps is installed
2. For iOS: May need to configure in Xcode
3. For Android: May need Google Maps API key (optional for basic testing)

**Solution:**
- Map should work in Expo without additional setup
- If issues persist, check Expo documentation for react-native-maps

### Fonts Not Loading

**Issue:** "Safe Travels" title doesn't show cursive font

**Solution:**
- Download Dancing Script fonts from Google Fonts
- Place in `assets/fonts/`:
  - `DancingScript-Regular.ttf`
  - `DancingScript-Bold.ttf`
- Or app will fallback to system fonts

---

## 📱 Testing Checklist

### Frontend Features
- [ ] Login screen displays correctly
- [ ] Server status shows connected
- [ ] Login navigates to Home
- [ ] Globe is interactive (pan/drag)
- [ ] Country markers are tappable
- [ ] Search filters countries
- [ ] Country modal opens
- [ ] Safety Rating tab shows correct rating
- [ ] News tab shows news stories
- [ ] Map screen loads
- [ ] Route line displays (green or red)
- [ ] Safety score overlay shows
- [ ] Panic button appears
- [ ] Alert dialog shows on panic button tap
- [ ] Emergency wipe works

### Backend Features
- [ ] Health endpoint returns 200
- [ ] Check safety endpoint validates input
- [ ] Check safety returns safety data
- [ ] Path risk calculates safety score
- [ ] AI advisor anonymizes data
- [ ] AI advisor rate limiting works (5 req/15 min)
- [ ] Other endpoints rate limited (100 req/15 min)
- [ ] Logout endpoint responds
- [ ] Error handling doesn't expose stack traces
- [ ] IP addresses are anonymized in logs

---

## 🎯 Quick Test Commands

### Start Everything
```bash
# Terminal 1: Backend
cd safe-travels-backend && npm run dev

# Terminal 2: Frontend
cd .. && npm start
# Then press 'i' for iOS or 'a' for Android
```

### Test Backend Only
```bash
cd safe-travels-backend
npm run dev

# In another terminal:
./test-endpoint.sh
./test-pathfinding.sh
./test-ai-advisor.sh
./test-rate-limit.sh
```

### Test Frontend Only
```bash
# Make sure backend is running first!
npm start
# Press 'i' or 'a' or scan QR code
```

---

## 📊 Expected Test Results

### Login Screen
- ✅ Rainbow gradient title visible
- ✅ Server status: Green dot, "Server connected"
- ✅ Login works with any credentials

### Home Screen
- ✅ Globe with country markers visible
- ✅ Search bar at top
- ✅ Map button (bottom-right)
- ✅ Panic button (bottom-left, red)

### Country Modal
- ✅ Canada: Green "Safe" rating
- ✅ Uganda: Red "Dangerous" rating
- ✅ Brazil: Yellow "Varies By Location"
- ✅ Russia: Orange "Avoid" rating
- ✅ News stories display correctly

### Map Screen
- ✅ Map displays with route
- ✅ Route line is green (safe route in Toronto)
- ✅ Safety score: 80-100 (Safe)
- ✅ Overlay shows score and details

### Backend Logs
- ✅ No PII in logs (emails/phones anonymized)
- ✅ IP addresses anonymized (192.168.1.xxx)
- ✅ Rate limit messages when exceeded
- ✅ Error IDs instead of stack traces

---

## 🎓 What You Should See

### Successful Test Run

1. **Backend starts** → Server running message
2. **Frontend starts** → Expo dev server with QR code
3. **Login screen** → Rainbow title, server status green
4. **Home screen** → Interactive globe, search bar
5. **Select country** → Modal opens with safety rating
6. **Map screen** → Route displayed with safety score
7. **Panic button** → Alert dialog, wipe works

### Backend Console Output

```
📡 API Configuration:
   Platform: ios
   Base URL: http://localhost:3000
   Environment: Development

   Found 1 email(s) and 1 phone number(s) - anonymizing
🔒 AFTER Anonymization:
{
  "question": "...",
  "email": "[REDACTED_EMAIL]",
  "phone": "[REDACTED_PHONE]"
}

Logout request received from IP: 192.168.1.xxx
```

---

## ✅ Success Criteria

Your app is working correctly if:

1. ✅ Backend starts without errors
2. ✅ Frontend connects to backend (green status)
3. ✅ All screens navigate correctly
4. ✅ Country selection works
5. ✅ Map displays route with safety score
6. ✅ Panic button shows alert and wipes data
7. ✅ Backend logs show anonymized data
8. ✅ Rate limiting works (429 after 5 AI requests)

---

**Ready to test?** Follow the steps above and you'll see all the features in action! 🚀

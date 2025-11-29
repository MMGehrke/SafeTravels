# Galois

A cross-platform mobile application built with React Native that helps travelers assess safety conditions in different countries around the world.

## Features

### 🎨 **Beautiful Login Page**
- Rainbow gradient "Safe Travels" title with cursive font
- Clean, modern login form with rounded corners and shadows
- Smooth animations and loading states

### 🌍 **Interactive Globe**
- 2D interactive globe representation
- Tap to select countries with visual feedback
- Pan gestures for globe interaction
- Color-coded country markers based on safety levels

### 🔍 **Smart Search**
- Real-time search functionality
- Search for countries by name
- Dropdown results with easy selection

### 📊 **Country Safety Ratings**
- Four-tier safety rating system:
  - 🟢 **Safe** (Green) - Generally safe with strong protections
  - 🟡 **Varies By Location** (Yellow) - Safety depends on specific regions
  - 🟠 **Avoid** (Orange) - Significant risks and restrictions
  - 🔴 **Dangerous** (Red) - Extremely dangerous, avoid travel

### 📰 **Latest News**
- Curated LGBTQIA+ news for each country
- Recent developments in rights and protections
- Source attribution and publication dates

### 🗺️ **Safe Pathfinding**
- Interactive map with route visualization
- Real-time safety score calculation
- Color-coded route paths (Green = Safe, Red = Risky)
- Risk area detection along routes

### 📢 **Anonymous Safety Reporting**
- Submit real-time safety reports from your location
- Completely anonymous (no user tracking)
- Rate locations 1-5 for safety
- Tag incidents (Harassment, Welcoming, Police Presence, etc.)
- Optional comments (280 characters max)

### 🔒 **Plausible Deniability Features**
- **Calculator Stealth Launcher**: App appears as a functional calculator
- **Secret PIN Unlock**: Enter custom PIN to access real app
- **Duress Mode**: Emergency wipe + decoy interface
- **Decoy Mode**: Generic tourist information to satisfy inspection
- **Dynamic App Icon**: Change app icon for additional camouflage (Android)

### 🛡️ **Security Features**
- Secure token storage (expo-secure-store)
- Emergency wipe functionality
- Secure data deletion
- IP-based rate limiting
- Input validation and sanitization

## Project Structure

```
SafeTravels/
├── App.js                          # Main app component with navigation
├── package.json                    # Dependencies and scripts
├── app.json                       # Expo configuration
├── babel.config.js                # Babel configuration
├── components/
│   ├── StealthLayout.js           # Calculator disguise (stealth launcher)
│   ├── DecoyMode.js               # Decoy tourist information
│   ├── MainApp.js                 # Real app navigator
│   ├── LoginPage.js               # Login screen with rainbow title
│   ├── HomePage.js                # Interactive globe and search
│   ├── MapScreen.js               # Safe pathfinding map view
│   ├── SafetyReportModal.js       # Anonymous safety reporting
│   ├── CamouflageSettings.js      # Dynamic app icon settings
│   ├── CountryModal.js            # Country detail modal with tabs
│   ├── SafetyRatingTab.js         # Safety rating information
│   └── NewsTab.js                 # News stories for each country
├── services/
│   └── api.js                     # API service for backend communication
├── utils/
│   ├── secureStorage.js           # Secure token storage utilities
│   └── dynamicAppIcon.js          # Dynamic app icon functionality
├── safe-travels-backend/          # Node.js/Express backend
│   ├── server.js                  # Main server file
│   ├── data/
│   │   ├── zones.js               # Safe zones data
│   │   ├── pathfinding.js         # Path risk calculation
│   │   └── safetyReports.js       # Anonymous reports storage
│   └── package.json               # Backend dependencies
├── assets/
│   └── fonts/                     # Custom fonts (Dancing Script)
└── README.md                      # This file
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SafeTravels
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd safe-travels-backend
   npm install
   cd ..
   ```

4. **Download Fonts**
   - Download Dancing Script fonts from [Google Fonts](https://fonts.google.com/specimen/Dancing+Script)
   - Place the `.ttf` files in `assets/fonts/`:
     - `DancingScript-Regular.ttf`
     - `DancingScript-Bold.ttf`

5. **Configure Environment Variables** (Optional)
   - Create `.env` file in project root:
     ```env
     EXPO_PUBLIC_STEALTH_PIN=5555=
     EXPO_PUBLIC_DURESS_PIN=9999=
     ```
   - **Note:** Change default PINs in production!

6. **Start the backend server**
   ```bash
   cd safe-travels-backend
   npm run dev
   ```

7. **Start the frontend development server** (in a new terminal)
   ```bash
   npm start
   ```

8. **Run on device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

## Available Scripts

### Frontend
- `npm start` - Start the Expo development server
- `npm run ios` - Run on iOS Simulator
- `npm run android` - Run on Android Emulator
- `npm run web` - Run in web browser

### Backend
- `cd safe-travels-backend && npm start` - Start backend server
- `cd safe-travels-backend && npm run dev` - Start backend with auto-reload

## Mock Data

The app uses comprehensive mock data for demonstration:

### Countries Available
- Canada (Safe)
- Uganda (Dangerous)
- Brazil (Varies By Location)
- Russia (Avoid)
- Australia (Safe)
- Japan (Safe)
- Germany (Safe)
- South Africa (Varies By Location)

### Safety Information
Each country includes:
- Safety rating with color coding
- Detailed description
- Key points about legal status
- Current conditions

### News Stories
Each country has 3 recent news stories covering:
- Legal developments
- Social progress
- Current events
- Community updates

## Technical Features

### Frontend
- **React Native & Expo**: Cross-platform mobile development
- **React Navigation v6**: Stack navigation with stealth/decoy modes
- **React Native Maps**: Interactive map with route visualization
- **Expo SecureStore**: Secure token storage (keychain/keystore)
- **Expo Location**: GPS location services
- **React Native Reanimated**: Smooth animations and gestures

### Backend
- **Node.js & Express**: RESTful API server
- **Express Validator**: Input validation and sanitization
- **Helmet**: Security HTTP headers
- **CORS**: Cross-origin resource sharing (whitelisted origins)
- **Rate Limiting**: IP-based request limiting
- **GeoJSON**: Geospatial data storage

### Security
- **Secure Storage**: expo-secure-store for sensitive data
- **Secure Deletion**: Data protection mechanisms
- **Input Sanitization**: XSS prevention, HTML stripping
- **Rate Limiting**: Prevents abuse and DoS attacks
- **IP Anonymization**: GDPR-compliant logging

### State Management
- React hooks (`useState`, `useEffect`)
- Local state for UI interactions
- Mock data simulation with loading states

### Navigation
- React Navigation v6
- Stack navigation between screens
- Modal presentation for country details
- Stealth/Decoy mode routing

### Animations
- React Native Reanimated
- Pan gesture handling for globe interaction
- Smooth transitions and loading animations

### Styling
- React Native StyleSheet
- Responsive design for different screen sizes
- Shadow effects and rounded corners
- Color-coded safety indicators

## Error Handling

- Input validation for login form
- Loading states for data fetching
- Fallback content for missing data
- Graceful error messages

## API Endpoints

### Backend Server (Port 3000)

- `GET /health` - Server health check
- `POST /api/check-safety` - Check safety for coordinates
- `POST /api/path-risk` - Calculate route safety score
- `POST /api/reports` - Submit anonymous safety report
- `GET /api/reports/tags` - Get allowed report tags
- `POST /api/ai-advisor` - AI-powered travel advice (with anonymization)
- `POST /api/logout` - Logout endpoint

## Security Features

### Plausible Deniability
- **Calculator Disguise**: App appears as functional calculator
- **Secret PIN**: Custom PIN unlocks real app
- **Duress PIN**: Emergency wipe + decoy mode
- **No Persistent State**: App always starts as calculator

### Data Protection
- **Secure Storage**: All tokens stored in device keychain/keystore
- **Secure Deletion**: Advanced data protection mechanisms
- **Anonymous Reporting**: No user tracking, IP-based rate limiting only
- **Input Validation**: Server-side validation prevents injection attacks

## Future Enhancements

- Real API integration for live data
- User accounts and preferences
- Offline data storage
- Push notifications for safety alerts
- Community reviews and ratings
- Travel planning features
- Emergency contact information
- Screenshot prevention (FLAG_SECURE)
- Network proxy integration (Tor/Snowflake)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.

---

**Note**: This is a demonstration app. All data is mock data and should not be used for actual travel planning. Always research current conditions and consult official sources before traveling. 
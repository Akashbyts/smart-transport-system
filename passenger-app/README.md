# passenger-app

# Passenger App - Compressed Prompt (12 Pages - No Payment)


## Tech Stack
- React Native with Expo
- React Navigation (Stack + Bottom Tabs)
- React Native Maps
- Expo Location, ImagePicker
- Socket.io-client for real-time updates
- Async Storage

## Colors (same as driver app)
primary: '#1E40AF', secondary: '#10B981', danger: '#EF4444', warning: '#F59E0B', background: '#F9FAFB', white: '#FFFFFF', text: '#111827', textSecondary: '#6B7280', border: '#E5E7EB'

## Constants
API_URL, SOCKET_URL, NEARBY_RADIUS_KM = 3, ALERT_RADIUS_METERS = 500

## Helper Functions
formatDate, formatTime, formatDateTime, formatDuration, formatDistance, formatETA, validateEmail, validatePhone, validatePassword, getStatusColor, calculateDistance

## File Structures
src/
├── api/ (client.js, auth.api.js, passenger.api.js)
├── components/common/ (Button, Header, Input, Loader, StatusBadge, Card)
├── components/passenger/ (BusCard, StopCard, RouteCard, TripCard)
├── context/ (AuthContext, PassengerContext)
├── navigation/ (AppNavigator, AuthNavigator, PassengerNavigator)
├── screens/auth/ (Welcome, Login, Register, OTPScreen, ForgotPassword)
├── screens/passenger/ (12 screens below)
├── storage/ (storage.js)
└── utils/ (colors, constants, helpers)
```

## Authentication Screens (5 - same pattern as driver)
1. **WelcomeScreen** - Bus icon, tagline, Get Started/Login buttons
2. **LoginScreen** - Email/Password, Forgot Password, OTP for new devices
3. **RegisterScreen** - Name, Email, Phone, Password, Confirm Password, Terms checkbox
4. **OTPScreen** - 6-digit OTP, resend timer (60s)
5. **ForgotPasswordScreen** - Email/Phone → OTP → New Password

## Passenger Screens (12 - NO PAYMENT)

### 1. HomeScreen (Dashboard - Main Tab)
- Header with user name, profile icon
- Search bar (buses/routes/stops)
- **Nearby Buses** (horizontal scroll): bus number, route, ETA minutes, tap to BusDetails
- **Favorite Routes** section with quick track button
- **Upcoming Alerts** section
- Mini map preview (optional)
- Pull to refresh

### 2. LiveTrackingScreen (Full Map Tab)
- Full-screen MapView with:
  - Bus markers (🚌 icon) with real-time positions
  - Stop markers (📍) tap to StopDetails
  - Route polylines (toggle)
  - User location circle
- Search bar + Filter by route
- Current location button
- Bottom sheet showing active buses list:
  - Bus number, route, speed, ETA to next stop
  - Tap to focus map or open BusDetails
- Socket.io for real-time bus updates

### 3. BusDetailsScreen
- Header: Bus number, model
- Map showing current bus location + route polyline
- Speed and status (On time/Delayed)
- **Stop Timeline**: upcoming stops with ETA, distance to next stop
- **Set Alert**: alert when bus approaches specific stop
- Share location button

### 4. StopDetailsScreen
- Stop name, location on map
- **Arriving Buses** list (real-time):
  - Bus number, route, ETA in minutes
  - Progress bar showing bus position
  - Tap to BusDetails
- All routes passing through this stop
- **Set Alert**: notify when specific bus arrives
- Directions to stop (opens maps)

### 5. RouteDetailsScreen
- Route name, number header
- Map with route polyline + stops marked + bus positions
- **Stop List**: all stops with distance from user, ETA for next bus
- **Schedule**: first/last bus, frequency (peak/off-peak times)
- Favorite button (save route)

### 6. NearbyStopsScreen
- Toggle between Map View / List View
- Shows stops within 3km with distance
- Each stop: name, distance, arriving buses count
- Search by stop name
- Filter by route
- Tap to StopDetails

### 7. TripPlannerScreen
- From input (current location / search stop)
- To input (search stop / address)
- Date & Time selector
- Plan Trip button
- **Results**: multiple route options showing:
  - Total duration, number of stops, walking distance
  - Expandable step-by-step directions with stop names
- Save Trip to favorites
- Start Navigation button (follow along mode)

### 8. FavoritesScreen (Tab)
- Segmented tabs: Routes / Stops / Buses / Trips
- Each favorite card: name/number, quick action button
- Swipe to delete
- Empty state with "Add favorites from route/stop/bus screens"

### 9. NotificationsScreen
- **Active Alerts** section:
  - Alert type (bus arrival at stop)
  - Trigger distance/time
  - Toggle enable/disable, delete button
- **Alert History**: past notifications with timestamp
- **Alert Settings**: push/email/SMS toggles, default radius

### 10. TripHistoryScreen
- List of completed trips
- Each trip: date, route, bus, duration, status
- Tap for **Trip Details**: stop-by-stop timeline, map of route taken
- Re-book button to plan same trip
- Rate Trip option (1-5 stars, no payment)

### 11. ProfileScreen (Tab)
- User details: name, email, phone (editable)
- Change Password section
- **Notification Preferences**: toggles for push/email/SMS
- **App Settings**: Dark mode toggle (Light/Dark/System), Language selector
- Privacy Policy, Terms of Service links
- Logout button
- Delete Account option

### 12. FeedbackScreen
- Issue Type selector (Bus delay/Wrong location/App issue/Suggestion/Other)
- Bus number input (if reporting bus)
- Route number input (if reporting route)
- Description textarea (required)
- Attach Photo option
- Rating (1-5 stars for experience)
- Submit button
- My Reports link

## Bottom Tab Navigation (5 tabs)
```
Tab 1: Home (HomeScreen)
Tab 2: Live Map (LiveTrackingScreen)
Tab 3: Trip Planner (TripPlannerScreen)
Tab 4: Favorites (FavoritesScreen)
Tab 5: Profile (ProfileScreen)



## Common Components (reuse from driver app)
- **Header** - title, back button, right component
- **Input** - label, error, password toggle
- **Button** - variants (primary/secondary/danger/outline/ghost), loading state
- **Loader** - spinner with message
- **StatusBadge** - colored dot + text
- **Card** - container with shadow

## Passenger Components
- **BusCard** - bus number, route, speed, ETA, onPress
- **StopCard** - stop name, distance, arriving buses count, onPress
- **RouteCard** - route name/number, start/end, stops count, onPress
- **TripCard** - date, route, bus, duration, status, onPress

## API Endpoints (NO PAYMENT)

POST   /api/passenger/login
POST   /api/passenger/register
POST   /api/passenger/forgot-password
POST   /api/passenger/reset-password
GET    /api/passenger/profile
PUT    /api/passenger/profile
POST   /api/passenger/change-password
GET    /api/passenger/buses/nearby?lat=&lon=&radius=
GET    /api/passenger/buses/:id
GET    /api/passenger/stops/nearby
GET    /api/passenger/stops/:id
GET    /api/passenger/stops/:id/arrivals
GET    /api/passenger/routes
GET    /api/passenger/routes/:id
POST   /api/passenger/trip/plan
GET    /api/passenger/trips
GET    /api/passenger/trips/:id
POST   /api/passenger/trips/:id/rate
GET    /api/passenger/favorites/:type
POST   /api/passenger/favorites
DELETE /api/passenger/favorites/:type/:id
GET    /api/passenger/alerts
POST   /api/passenger/alerts
DELETE /api/passenger/alerts/:id
GET    /api/passenger/notifications
POST   /api/passenger/notifications/:id/read
POST   /api/passenger/feedback
```

## Real-time (Socket.io)
- Connect on app start with auth token
- Events: bus:location:update, bus:arrival:alert, trip:delay:update
- Update bus positions on LiveTrackingScreen in real-time
- Trigger push notifications for user alerts

## Location Services
- Request foreground permission on HomeScreen mount
- Get current location for nearby searches
- Watch position for "Nearby Buses" feature

## Storage Keys
- ACCESS_TOKEN, REFRESH_TOKEN, USER_DATA
- OTP_VERIFIED_PREFIX + phone
- DARK_MODE_PREFERENCE
- FAVORITES_CACHE
- ALERTS_CACHE

## Navigation Flows
1. **Auth**: Welcome → Register/Login → OTP → Home
2. **Track Bus**: Home/LiveMap → Tap Bus → BusDetails → Set Alert
3. **Find Stop**: NearbyStops → Tap Stop → StopDetails → Set Alert
4. **Plan Trip**: TripPlanner → Select Route → Save to Favorites
5. **Manage**: Profile → TripHistory → Trip Details → Rate / Re-book

## Styling Requirements
- Same as driver app: borderRadius: 16, consistent shadows
- Dark mode support using Appearance API
- SafeAreaView for all screens
- Pull-to-refresh on list screens

## EXCLUDE (No Payment Features)
- NO fare estimates
- NO payment methods
- NO wallet/balance
- NO ticket purchasing
- NO transaction history
- NO payment confirmation screens



Summary: 12 Passenger Pages (No Payment)

| # | Screen | Purpose |
|---|--------|---------|
| 1 | HomeScreen | Main dashboard with nearby buses |
| 2 | LiveTrackingScreen | Full map with real-time bus tracking |
| 3 | BusDetailsScreen | Single bus details + stop timeline |
| 4 | StopDetailsScreen | Stop info + arriving buses |
| 5 | RouteDetailsScreen | Route map + stop list + schedule |
| 6 | NearbyStopsScreen | Find stops near user |
| 7 | TripPlannerScreen | Plan journey (duration, stops, walking) |
| 8 | FavoritesScreen | Saved routes/stops/buses/trips |
| 9 | NotificationsScreen | Manage alerts + history |
| 10 | TripHistoryScreen | Past trips + rate + re-book |
| 11 | ProfileScreen | User settings + preferences |
| 12 | FeedbackScreen | Report issues + suggestions |


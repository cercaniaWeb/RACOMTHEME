# Progressive Web App (PWA) Features

## Overview
This POS application includes full PWA support, allowing it to work offline and be installed on mobile devices like a native app.

## Key PWA Features

### 1. Installable
- Can be installed on mobile devices and desktop computers
- Appears as a standalone app with its own icon
- Works without a browser interface

### 2. Offline Support
- Data is cached locally using IndexedDB
- Works even when there's no internet connection
- Transactions are stored locally and synced when online

### 3. Responsive Design
- Optimized for all screen sizes (mobile, tablet, desktop)
- Touch-friendly interface for mobile devices
- Adapts to different orientations

### 4. Network Resilience
- Automatically detects network status
- Switches between online and offline modes seamlessly
- Shows clear indicators when working offline

## Technical Implementation

### Service Worker
- Caches critical assets for offline access
- Handles network requests and provides fallbacks
- Manages background synchronization

### Manifest File
- Defines app appearance and behavior
- Includes app icons and theme colors
- Specifies display mode and start URL

### IndexedDB Storage
- Stores products, categories, and inventory data
- Caches transactions for offline processing
- Maintains data consistency across sessions

## How to Use PWA Features

### Installing the App
1. Open the app in a modern browser (Chrome, Edge, Firefox, Safari)
2. Look for the install prompt or menu option
3. Click "Install" or "Add to Home Screen"
4. The app will appear as a standalone icon on your device

### Working Offline
1. The app automatically detects network status
2. When offline, you can still:
   - View product catalogs
   - Process sales (stored locally)
   - Access previous transactions
3. When online again, data syncs automatically

### Network Status Indicators
- Green dot: Online and connected
- Red dot with "Modo Sin Conexión": Working offline
- Yellow banner: Network issues detected

## Building for Production
To build the PWA for production:

```bash
npm run build-pwa
```

This command:
1. Builds the React app
2. Copies PWA assets to the dist folder
3. Prepares the app for deployment

## Testing Offline Mode
1. Open Chrome DevTools
2. Go to the Application tab
3. Check "Offline" in the Network conditions
4. Refresh the page to see offline behavior

## Supported Browsers
- Chrome 67+
- Edge 79+
- Firefox 63+
- Safari 11.1+

Note: Some features may vary by browser.
# Ad System Documentation

## Overview
The ad system integrates YouTube video ads into the video player for unauthenticated users. Ads are shown as overlays during video playback.

## Components

### 1. InPlayerAdManager
Manages the display of periodic ads during video playback.

**Props:**
- `isAuthenticated`: Boolean indicating if user is logged in
- `adInterval`: Minutes between ads (default: 10)
- `adDuration`: Seconds each ad displays (default: 15)
- `youtubeVideoIds`: Array of YouTube video IDs for ads
- `onAdStart`: Callback when ad starts
- `onAdEnd`: Callback when ad ends

### 2. VideoAdOverlay
Displays initial ad overlay when user starts watching content.

**Props:**
- `onClose`: Callback when overlay is closed
- `onSkip`: Callback when ad is skipped
- `youtubeVideoId`: Specific YouTube video ID to display

### 3. AdService
Manages ad inventory and rotation.

**Methods:**
- `getNextYouTubeAd()`: Gets next ad in rotation
- `getAllYouTubeAds()`: Returns all available ads
- `getAdTiming()`: Returns ad timing configuration

## Configuration

### adConfig.ts
Contains ad timing and video ID configuration:

```typescript
export const adConfig = {
  adInterval: 10, // minutes
  adDuration: 15, // seconds
  youtubeAdVideoIds: [
    "dQw4w9WgXcQ", // Rick Astley - Never Gonna Give You Up
    "kJQP7kiw5Fk", // Luis Fonsi - Despacito
    // ... more video IDs
  ]
};
```

## Integration Points

### Watch Pages
Ads are integrated into:
- `watch-movie.tsx`
- `watch-tv.tsx`

Only unauthenticated users see ads:
```tsx
{shouldShowAds && (
  <InPlayerAdManager 
    isAuthenticated={false}
    adInterval={adConfig.adInterval}
    adDuration={adConfig.adDuration}
    youtubeVideoIds={adConfig.youtubeAdVideoIds}
  />
)}
```

## Testing

### Test Pages
1. `/test-ads` - General ad testing
2. `/youtube-ad-test` - YouTube-specific ad testing

### Console Debugging
Enable verbose logging by checking browser console for:
- Ad initialization
- Ad display events
- Timing information
- Error messages

## Troubleshooting

### CSP Issues
If YouTube ads don't display:
1. Check browser console for CSP violations
2. Verify `frame-src` includes YouTube domains
3. Ensure `script-src` allows necessary YouTube scripts

### Ad Not Showing
1. Verify user is not authenticated
2. Check that `youtubeVideoIds` array is populated
3. Confirm ad timing intervals are appropriate
4. Review console logs for initialization errors

## YouTube Video IDs
Current test videos:
- `dQw4w9WgXcQ` - Rick Astley - Never Gonna Give You Up
- `kJQP7kiw5Fk` - Luis Fonsi - Despacito
- `CevxZvSJLk8` - PSY - GANGNAM STYLE
- `JGwWNGJdvx8` - Ed Sheeran - Shape of You
- `kJUnF2JktFM` - Maroon 5 - Sugar
- `h_D3VFfhvs4` - Michael Jackson - Billie Jean
- `2Vv-BfVoq4g` - Adele - Hello
- `9bZkp7q19f0` - PSY - GANGNAM STYLE (alternative)

Replace these with actual advertisement videos as needed.
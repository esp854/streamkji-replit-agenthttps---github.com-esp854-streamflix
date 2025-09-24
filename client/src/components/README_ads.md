# Advertisement System Documentation

## Overview
This document explains the advertisement system implemented for the video streaming platform. The system shows YouTube video ads to unauthenticated users with the following specifications:

- **Ad Duration**: 15 seconds
- **Ad Frequency**: Every 10 minutes during video playback
- **Target Audience**: Only unauthenticated users
- **Ad Types**: YouTube video ads

## Components

### 1. Ad Configuration (`/config/adConfig.ts`)
Central configuration file for ad settings:
- Ad interval (10 minutes)
- Ad duration (15 seconds)
- YouTube video IDs for ads

### 2. Ad Service (`/services/adService.ts`)
Manages ad rotation and provides ad-related functionality:
- Retrieves next YouTube ad in rotation
- Manages ad inventory
- Provides ad timing information

### 3. Ad Manager Hook (`/hooks/useAdManager.ts`)
React hook for managing ad timing and display:
- Handles periodic ad scheduling
- Manages ad state
- Provides ad control functions

### 4. In-Player Ad Manager (`/components/InPlayerAdManager.tsx`)
Component that displays ads during video playback:
- Shows ads every 10 minutes
- Displays YouTube video ads
- Automatically closes after 15 seconds

### 5. Pre-Roll Ad (`/components/PreRollAd.tsx`)
Component that shows ads before video starts:
- Displays before the main video content
- Automatically closes after 15 seconds
- Can be manually skipped

### 6. Video Ad Overlay (`/components/VideoAdOverlay.tsx`)
Overlay component for initial ad display:
- Shows when unauthenticated users start watching
- Integrates with PreRollAd component
- Supports specific YouTube video IDs

### 7. Zupload Video Player (`/components/zupload-video-player.tsx`)
Main video player component:
- Shows initial ad overlay for unauthenticated users
- Passes YouTube ad video IDs to ad components

## Implementation Details

### Ad Timing
- **Initial Ad**: Shows before video starts (15 seconds)
- **Periodic Ads**: Every 10 minutes during playback (15 seconds each)

### Authentication Check
Ads are only shown to unauthenticated users. Authenticated users have an ad-free experience.

### YouTube Integration
YouTube videos are embedded using iframes with the following parameters:
- `autoplay=1`: Automatically starts playback
- `mute=1`: Starts muted to comply with browser policies
- `controls=0/1`: Controls visibility based on ad type
- `showinfo=0`: Hides video information
- `rel=0`: Hides related videos
- `modestbranding=1`: Reduces YouTube branding

## Customization

### Changing Ad Frequency
Modify the `adInterval` value in `/config/adConfig.ts` to change how often ads appear.

### Changing Ad Duration
Modify the `adDuration` value in `/config/adConfig.ts` to change how long ads are displayed.

### Adding/Removing YouTube Ads
Update the `youtubeAdVideoIds` array in `/config/adConfig.ts` to change the ad inventory.

### Using Specific YouTube Videos
Pass a `youtubeAdVideoId` prop to the `ZuploadVideoPlayer` component to show a specific YouTube video as an ad.

## Example Usage

```tsx
// In watch pages
<ZuploadVideoPlayer 
  videoUrl={videoUrl}
  title={movieTitle}
  youtubeAdVideoId="dQw4w9WgXcQ" // Specific YouTube video ID
/>

// In player ad manager
<InPlayerAdManager 
  isAuthenticated={!shouldShowAds}
  adInterval={10}
  adDuration={15}
  onAdStart={() => console.log("Ad started")}
  onAdEnd={() => console.log("Ad ended")}
/>
```

## File Structure
```
/client/src/
├── components/
│   ├── InPlayerAdManager.tsx
│   ├── PreRollAd.tsx
│   ├── VideoAdOverlay.tsx
│   └── zupload-video-player.tsx
├── config/
│   └── adConfig.ts
├── hooks/
│   └── useAdManager.ts
├── services/
│   └── adService.ts
└── pages/
    ├── watch-movie.tsx
    └── watch-tv.tsx
```
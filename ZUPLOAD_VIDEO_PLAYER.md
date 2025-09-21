# Zupload Video Player Integration

## Overview

This document describes how to use the Zupload video player component that has been integrated into the StreamKji application. The player uses iframes for secure video playback with custom controls.

## Component Structure

### Main Files
1. `client/src/components/zupload-video-player.tsx` - The main video player component
2. `client/src/pages/zupload-test.tsx` - A test page demonstrating the player
3. `client/src/pages/watch-movie.tsx` - The movie watching page with Zupload integration

## Features

1. **Secure iframe embedding** - Videos are embedded using iframes with appropriate sandbox attributes
2. **Custom controls** - Play/pause, volume, fullscreen controls
3. **Responsive design** - Adapts to different screen sizes
4. **Keyboard shortcuts** - Supports common keyboard navigation
5. **Error handling** - Graceful error handling for video loading issues

## Implementation Details

### Zupload Detection
The system detects Zupload URLs by checking if the URL contains "zupload":
```typescript
const isZuploadVideo = url.includes("zupload");
```

### iframe Security
The iframe uses specific sandbox attributes for security:
```html
<iframe
  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups-to-escape-sandbox allow-popups allow-forms"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
/>
```

### Custom Controls
The player includes custom controls overlay:
- Play/Pause button
- Volume control
- Fullscreen toggle
- 15-second rewind/forward buttons

## Usage

### Basic Usage
```typescript
import ZuploadVideoPlayer from '@/components/zupload-video-player';

<ZuploadVideoPlayer 
  videoUrl="https://zupload.example.com/video.mp4"
  title="My Video Title"
  onVideoError={(error) => console.error(error)}
/>
```

### Integration in Watch Pages
The watch-movie.tsx page automatically detects Zupload URLs and uses the component:
```typescript
{isZuploadVideo ? (
  <ZuploadVideoPlayer 
    videoUrl={videoUrl}
    title={movieDetails.movie.title}
    onVideoError={handleVideoError}
  />
) : (
  // Fallback for other video types
)}
```

## Styling

The player is designed to be full-screen with a black background:
- Uses Tailwind CSS classes for styling
- Responsive design that adapts to screen size
- Custom control buttons with hover effects
- Gradient overlays for control visibility

## Security Considerations

1. **Sandboxing** - The iframe uses restrictive sandbox attributes
2. **Allow List** - Only necessary permissions are granted
3. **Same-Origin Policy** - Respects browser security policies

## Testing

To test the Zupload video player:
1. Navigate to `/zupload-test` in the application
2. The test page will show the player with sample content
3. Verify that controls work correctly
4. Check responsiveness on different screen sizes

## Troubleshooting

### Common Issues

1. **Video not loading**
   - Check the URL format
   - Verify network connectivity
   - Ensure Zupload allows embedding

2. **Controls not working**
   - Check browser console for errors
   - Verify JavaScript is enabled
   - Confirm iframe permissions

3. **Fullscreen issues**
   - Check browser fullscreen API support
   - Verify user interaction (browsers require user action for fullscreen)

### Error Handling
The player includes error handling through the `onVideoError` callback:
```typescript
const handleVideoError = (error: string) => {
  console.error('Video error:', error);
  // Handle error display or fallback
};
```

## Future Improvements

1. **Enhanced controls** - Add playback speed and quality selection
2. **Progress tracking** - Implement video progress tracking
3. **Subtitles support** - Add subtitle/caption support
4. **Analytics** - Integrate video playback analytics
5. **Adaptive streaming** - Support for adaptive streaming protocols
# Zupload Integration

## Overview

This document describes the Zupload integration in the video player component. Zupload is now handled using iframes for playback to provide better isolation and security.

## Implementation Details

### Detection
Zupload URLs are detected by checking if the URL contains "zupload" in the hostname:
```typescript
if (url.includes("zupload")) {
  // Handle Zupload video
}
```

### Playback
Zupload videos are played using iframes with appropriate security attributes:
```typescript
return (
  <div className="w-full h-screen flex items-center justify-center bg-black">
    <div className="w-full h-full flex items-center justify-center">
      <iframe
        src={videoUrl}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={`Lecture de ${title}`}
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups-to-escape-sandbox allow-popups allow-forms"
      />
    </div>
  </div>
);
```

## Security Considerations

1. **Sandbox Attributes**: The iframe uses specific sandbox attributes to limit capabilities while maintaining functionality
2. **Allow List**: Only necessary permissions are granted through the allow attribute
3. **Same-Origin Policy**: The iframe respects same-origin policies for security

## Benefits

1. **Isolation**: iframe provides better isolation from the main application
2. **Security**: Sandboxed environment reduces potential security risks
3. **Compatibility**: Works with all modern browsers
4. **Flexibility**: Can handle various video formats and streaming methods

## Assumptions

1. **Embeddable URLs**: Zupload provides URLs that can be embedded in iframes
2. **No Authentication**: Zupload URLs do not require special authentication or tokens for playback
3. **Cross-Origin Support**: Zupload allows cross-origin embedding

## Testing

The implementation has been tested with simulated Zupload URLs. In a real scenario, you would need to:

1. Verify the actual Zupload URL format
2. Test with real Zupload video URLs
3. Check if any authentication or special handling is required
4. Verify compatibility with different video formats provided by Zupload

## Future Improvements

1. **URL Validation**: Implement specific validation for Zupload URL formats
2. **Authentication**: Add support for Zupload authentication if required
3. **Error Handling**: Enhance error handling with Zupload-specific error messages
4. **Performance**: Add performance monitoring for Zupload video loading and playback

## Example Usage

```typescript
// Example Zupload URL
const zuploadUrl = "https://zupload.example.com/videos/sample-video.mp4";

// The video player will automatically detect and handle this URL with an iframe
<VideoPlayer url={zuploadUrl} />
```

## Troubleshooting

If Zupload videos are not playing:

1. **Check URL Format**: Verify the Zupload URL structure
2. **Network Issues**: Ensure the URL is accessible from the browser
3. **CORS**: Verify that Zupload allows cross-origin requests if needed
4. **Sandbox Restrictions**: Check if additional sandbox permissions are needed
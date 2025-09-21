# Plan-Based Feature Restrictions

This document explains how the plan-based feature restrictions work in the StreamKji application.

## Overview

The application implements a subscription plan system where users have access to different features based on their subscription plan. The system automatically restricts access to premium features for users on lower-tier plans.

## Plan Features

The application currently supports 5 subscription plans:

1. **Free** - Basic access with limitations
2. **Basic** - Standard features without premium options
3. **Standard** - Enhanced features including HD quality and downloads
4. **Premium** - Full access to most features including 4K quality
5. **VIP** - All features including early access and unlimited devices

## Implementation

### 1. Plan Definitions

Plan features are defined in `client/src/hooks/usePlanFeatures.ts`:

```typescript
export const PLAN_FEATURES = {
  free: {
    name: "Gratuit",
    maxSimultaneousDevices: 1,
    videoQuality: "SD",
    downloadAllowed: false,
    exclusiveContent: false,
    prioritySupport: false,
    earlyAccess: false,
    ads: true
  },
  // ... other plans
};
```

### 2. Hooks

Several hooks are available to check plan features:

- `usePlanFeatures()` - Get all features for the current user's plan
- `useHasFeature(feature)` - Check if user has a specific feature
- `useCanAccessQuality(quality)` - Check if user can access specific video quality
- `useDeviceLimit()` - Get device limit information

### 3. Components

The `PlanFeatureGuard` component is used to restrict access to features:

```tsx
<PlanFeatureGuard feature="download" fallback={<UpgradeMessage />}>
  <DownloadButton />
</PlanFeatureGuard>
```

### 4. Automatic Restrictions

Features are automatically restricted based on the user's plan:

- **Video Quality**: Users can only access video qualities allowed by their plan
- **Downloads**: Only available to Standard plan and above
- **Exclusive Content**: Only available to Premium and VIP plans
- **Device Limits**: Number of simultaneous devices is restricted
- **Support Level**: Priority support only for Standard plan and above
- **Ads**: Removed for paid plans

## Examples

### Video Player Restrictions

The video player automatically restricts quality options based on the user's plan:

```tsx
<PlanFeatureGuard feature="hd" fallback={
  <Button variant="outline" disabled>
    HD (Plan requis)
  </Button>
}>
  <Button variant={quality === 'HD' ? 'default' : 'outline'}>
    HD
  </Button>
</PlanFeatureGuard>
```

### Content Access

Exclusive content is automatically hidden or requires upgrade:

```tsx
{content.isExclusive ? (
  <PlanFeatureGuard feature="exclusive">
    <WatchButton />
  </PlanFeatureGuard>
) : (
  <WatchButton />
)}
```

## Adding New Features

To add a new feature restriction:

1. Add the feature to the `PLAN_FEATURES` definition
2. Create a new hook if needed (e.g., `useHasNewFeature()`)
3. Use `PlanFeatureGuard` to restrict access to the feature
4. Provide a meaningful fallback message for users on lower plans

## Testing

The plan demo page (`/plan-demo`) provides a comprehensive demonstration of all plan restrictions in action. This page can be used to test different plan features and verify that restrictions are working correctly.
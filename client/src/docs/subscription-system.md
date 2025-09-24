# Subscription System Documentation

## Overview
The subscription system ensures that authenticated users (except admins) must have an active subscription to watch movies and TV series.

## Components

### 1. useSubscriptionCheck Hook
Checks if a user has an active subscription.

**Returns:**
- `isAdmin`: Boolean indicating if user is admin
- `hasActiveSubscription`: Boolean indicating if user has active subscription
- `shouldRedirectToSubscription`: Boolean indicating if user should be redirected
- `currentSubscription`: Current subscription data
- `subscriptionLoading`: Boolean indicating if subscription data is loading

### 2. SubscriptionGuard Component
Wraps content that requires an active subscription.

**Props:**
- `children`: Content to protect

### 3. SubscriptionRequiredMessage Component
Displays a message when users are redirected to subscribe.

## Implementation

### Watch Pages
Both watch movie and watch TV pages are protected:
- `watch-movie.tsx`
- `watch-tv.tsx`

The pages are wrapped with `SubscriptionGuard` which:
1. Allows unauthenticated users to view content (with ads)
2. Allows admin users to view all content
3. Redirects authenticated non-admin users without active subscriptions to the subscription page

### Logic Flow
1. User tries to access watch page
2. SubscriptionGuard checks authentication status
3. If not authenticated → Allow access (with ads)
4. If authenticated:
   - Check if admin → Allow access
   - If not admin:
     - Check for active subscription → Allow access if active
     - If no active subscription → Redirect to subscription page

## API Endpoints Used

### GET /api/subscription/current
Returns the current user's subscription information.

**Response:**
```json
{
  "id": "subscription_id",
  "userId": "user_id",
  "planId": "premium",
  "amount": 5000,
  "paymentMethod": "orange_money",
  "status": "active",
  "startDate": "2023-01-01T00:00:00.000Z",
  "endDate": "2023-02-01T00:00:00.000Z",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

## User Roles

### Admin Users
- Role: `admin`
- Can access all content without subscription
- Identified by `user.role === 'admin'`

### Regular Users
- Role: `user`
- Must have active subscription to watch content
- Active subscription means:
  - `status === 'active'`
  - `endDate` is in the future

## Testing

### Admin Access
1. Log in as admin user
2. Try to watch any movie/series
3. Should have full access without subscription

### Regular User Access
1. Log in as regular user
2. Try to watch movie/series without subscription
3. Should be redirected to subscription page
4. Subscribe to a plan
5. Try to watch movie/series again
6. Should have access

### Unauthenticated User Access
1. Access watch page without logging in
2. Should be able to watch content (with ads)

## Error Handling

### Subscription Loading
While checking subscription status, a loading message is displayed.

### Network Errors
If there are issues fetching subscription data, the system defaults to redirecting to the subscription page to prevent unauthorized access.

## Future Improvements

1. Add grace period for expired subscriptions
2. Implement subscription trial periods
3. Add more detailed subscription management features
4. Improve error handling and user feedback
# Stripe 7-Day Free Trial Implementation

This document explains the complete implementation of a 7-day free trial system using Stripe subscriptions.

## Overview

The system provides users with a 7-day free trial period when they subscribe to any package. After the trial period ends, Stripe automatically charges the user's payment method and converts the subscription to active status.

## Key Features

- ✅ 7-day free trial for all new subscriptions
- ✅ Automatic billing after trial period
- ✅ Proper webhook handling for trial events
- ✅ Trial status tracking and validation
- ✅ Access control based on trial/subscription status
- ✅ Comprehensive API endpoints for trial management

## Implementation Details

### 1. Checkout Session with Trial Period

**File:** `src/app/modules/subscription/subscription.service.ts`

The `createSubscriptionCheckoutSession` function now includes:
```typescript
subscription_data: {
    trial_period_days: 7,
    metadata: {
        userId: String(userId),
        packageId: String(isExistPackage._id),
    },
}
```

### 2. Webhook Event Handlers

#### A. Subscription Created Handler
**File:** `src/helpers/stripe/handlers/handleSubscriptionCreated.ts`

- Detects if subscription is in trial period (`subscription.status === 'trialing'`)
- Sets user status accordingly:
  - Trial: `isFreeTrial: true`, `trialExpireAt: trial_end_date`
  - Paid: `isFreeTrial: false`, `trialExpireAt: null`

#### B. Subscription Updated Handler
**File:** `src/helpers/stripe/handlers/handleSubscriptionUpdated.ts`

- Handles trial-to-active transitions
- Updates user status when trial period ends
- Manages subscription upgrades/downgrades

#### C. Trial Will End Handler
**File:** `src/helpers/stripe/handlers/handleTrialWillEnd.ts`

- Handles `customer.subscription.trial_will_end` events
- Sends notifications before trial expires
- Updates user trial status

### 3. Trial Status Management

#### A. Trial Status Utility
**File:** `src/helpers/subscription/checkTrialStatus.ts`

Provides functions to:
- Check current trial status
- Calculate days remaining
- Validate trial expiration

#### B. Subscription Access Middleware
**File:** `src/app/middleware/checkSubscriptionAccess.ts`

- Validates user access based on subscription/trial status
- Provides detailed error messages for different scenarios
- Can be used to protect premium content routes

### 4. API Endpoints

#### A. Trial Status Endpoint
```
GET /api/v1/subscription/trial-status
```
Returns:
```json
{
    "isInTrial": true,
    "trialEndsAt": "2024-01-15T10:30:00.000Z",
    "daysRemaining": 5,
    "hasActiveSubscription": true
}
```

#### B. Access Check Endpoint
```
GET /api/v1/subscription/check-access
```
Returns:
```json
{
    "hasAccess": true,
    "isSubscribed": true,
    "trialStatus": {
        "isInTrial": true,
        "trialEndsAt": "2024-01-15T10:30:00.000Z",
        "daysRemaining": 5,
        "hasActiveSubscription": true
    },
    "packageName": "Premium Plan"
}
```

## User Flow

### 1. Subscription Creation
1. User clicks subscribe on a package
2. Stripe checkout session created with 7-day trial
3. User enters payment details (card is saved but not charged)
4. Subscription created in "trialing" status
5. User gets immediate access to premium content

### 2. During Trial Period
1. User has full access to premium features
2. `isFreeTrial: true` in user record
3. `trialExpireAt` shows when trial ends
4. No charges made to payment method

### 3. Trial End
1. Stripe automatically charges the payment method
2. Subscription status changes to "active"
3. `customer.subscription.updated` webhook fired
4. User status updated: `isFreeTrial: false`
5. User continues to have access (now as paid subscriber)

### 4. Failed Payment
If payment fails at trial end:
1. Subscription status becomes "past_due"
2. User access can be revoked based on business logic
3. Stripe retry logic handles payment attempts

## Database Schema Updates

### User Model Fields
- `isFreeTrial`: Boolean indicating if user is in trial
- `trialExpireAt`: Date when trial expires
- `isSubscribed`: Boolean for subscription status
- `hasAccess`: Boolean for content access
- `packageName`: Current package name

### Subscription Model Fields
- `status`: Subscription status (active, trialing, canceled, etc.)
- `subscriptionId`: Stripe subscription ID
- `currentPeriodStart`: Current billing period start
- `currentPeriodEnd`: Current billing period end

## Stripe Webhook Events Handled

1. `customer.subscription.created` - New subscription (trial or paid)
2. `customer.subscription.updated` - Status changes, upgrades, trial-to-active
3. `customer.subscription.deleted` - Subscription cancellation
4. `customer.subscription.trial_will_end` - Trial ending soon (3 days before)

## Error Handling

### Trial Expired
```json
{
    "statusCode": 402,
    "message": "Your free trial has expired. Please subscribe to continue accessing premium content."
}
```

### No Subscription
```json
{
    "statusCode": 402,
    "message": "You need an active subscription to access this content. Please subscribe to continue."
}
```

## Usage Examples

### Protecting Routes with Subscription Check
```typescript
import checkSubscriptionAccess from '../middleware/checkSubscriptionAccess';

// Protect premium video routes
router.get('/premium-videos', 
    auth(USER_ROLES.USER), 
    checkSubscriptionAccess, 
    VideoController.getPremiumVideos
);
```

### Checking Trial Status in Controller
```typescript
const getVideoDetails = async (req: Request, res: Response) => {
    const trialStatus = (req as any).trialStatus;
    const userAccess = (req as any).userAccess;
    
    // Use trial status for business logic
    if (trialStatus.isInTrial && trialStatus.daysRemaining <= 2) {
        // Show trial ending warning
    }
};
```

## Testing

### Test Trial Flow
1. Create test subscription with trial
2. Verify user status during trial
3. Use Stripe CLI to simulate trial end
4. Verify automatic billing and status update

### Stripe CLI Commands
```bash
# Listen to webhooks
stripe listen --forward-to localhost:7000/api/v1/stripe/webhook

# Simulate trial will end
stripe events resend evt_test_webhook --webhook-endpoint we_test_webhook
```

## Security Considerations

1. **Webhook Signature Verification**: All webhooks are verified using Stripe signatures
2. **Access Control**: Middleware validates subscription status on each request
3. **Trial Abuse Prevention**: Each user can only have one trial per email
4. **Payment Method Required**: Stripe requires valid payment method for trial

## Monitoring and Analytics

### Key Metrics to Track
- Trial conversion rate (trial → paid)
- Trial abandonment rate
- Average trial usage
- Payment failure rates at trial end

### Logging
- All webhook events are logged
- Trial status changes are tracked
- Payment failures are monitored

## Troubleshooting

### Common Issues
1. **Webhook not received**: Check Stripe webhook endpoint configuration
2. **Trial not starting**: Verify `trial_period_days` in checkout session
3. **Access denied during trial**: Check user `hasAccess` and `isFreeTrial` flags
4. **Payment fails at trial end**: Implement retry logic and user notifications

### Debug Endpoints
- `GET /api/v1/subscription/trial-status` - Check current trial status
- `GET /api/v1/subscription/check-access` - Verify access permissions
- `GET /api/v1/subscription/details` - Full subscription details

This implementation provides a robust, production-ready 7-day trial system that integrates seamlessly with Stripe's subscription management and handles all edge cases properly.
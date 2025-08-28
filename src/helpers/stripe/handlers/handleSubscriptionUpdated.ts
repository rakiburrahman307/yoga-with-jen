import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import stripe from '../../../config/stripe';
import AppError from '../../../errors/AppError';
import { User } from '../../../app/modules/user/user.model';
import { Package } from '../../../app/modules/package/package.model';
import { Subscription } from '../../../app/modules/subscription/subscription.model';
import { SubscriptionNotificationService } from '../../../app/modules/subscription/subscription.notification';
// const formatUnixToDate = (timestamp: number) => new Date(timestamp * 1000);
const formatUnixToIsoUtc = (timestamp: number): string => {
     const date = new Date(timestamp * 1000);
     return date.toISOString().replace('Z', '+00:00');
};

export const handleSubscriptionUpdated = async (data: Stripe.Subscription) => {
     try {
          // Retrieve the subscription from Stripe
          const subscription = await stripe.subscriptions.retrieve(data.id);

          // Retrieve the customer associated with the subscription
          const customer = (await stripe.customers.retrieve(subscription.customer as string)) as Stripe.Customer;

          // Extract price ID from subscription items
          const priceId = subscription.items.data[0]?.price?.id;

          // Retrieve the invoice to get the transaction ID and amount paid
          const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);

          const trxId = invoice?.payment_intent;
          const amountPaid = invoice?.total / 100;
          // Extract other needed fields from the subscription object
          const remaining = subscription.items.data[0]?.quantity || 0;
          // Convert Unix timestamp to Date
          // const currentPeriodStart = formatUnixToDate(subscription.current_period_start);
          // const currentPeriodEnd = formatUnixToDate(subscription.current_period_end);
          const subscriptionId = subscription.id;
          if (customer?.email) {
               // Find the user by email
               const existingUser = await User.findOne({ email: customer?.email });

               if (!existingUser) {
                    throw new AppError(StatusCodes.NOT_FOUND, `User not found for email: ${customer?.email}`);
               }
               // Find the pricing plan by priceId
               const pricingPlan = await Package.findOne({ priceId });
               if (!pricingPlan) {
                    throw new AppError(StatusCodes.NOT_FOUND, `Pricing plan with Price ID: ${priceId} not found!`);
               }

               // Find the current subscription (active or trialing) and populate the package field
               const currentSubscription = await Subscription.findOne({
                    userId: existingUser._id,
                    status: { $in: ['active', 'trialing'] },
               }).populate('package');

               if (currentSubscription) {
                    if (String((currentSubscription?.package as any)?.priceId) !== priceId) {
                         // Deactivate the old subscription
                         await Subscription.findByIdAndUpdate(
                              currentSubscription?._id,
                              {
                                   status: 'deactivated',
                                   remaining: 0,
                                   currentPeriodEnd: null,
                                   currentPeriodStart: null,
                              },
                              { new: true },
                         );

                         // Prepare new subscription data
                         const newSubscriptionData: any = {
                              userId: existingUser._id,
                              customerId: customer.id,
                              package: pricingPlan._id,
                              price: amountPaid,
                              trxId,
                              subscriptionId,
                              currentPeriodStart: formatUnixToIsoUtc(subscription.current_period_start),
                              currentPeriodEnd: formatUnixToIsoUtc(subscription.current_period_end),
                              remaining,
                              status: subscription.status === 'trialing' ? 'trialing' : 'active',
                              cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
                         };

                         // Add trial fields if in trial
                         if (subscription.status === 'trialing' && subscription.trial_start && subscription.trial_end) {
                              newSubscriptionData.trialStart = formatUnixToIsoUtc(subscription.trial_start);
                              newSubscriptionData.trialEnd = formatUnixToIsoUtc(subscription.trial_end);
                         }

                         // Create a new subscription
                         const newSubscription = new Subscription(newSubscriptionData);
                         await newSubscription.save();
                    } else {
                         // Update existing subscription (e.g., trial to active transition)
                         const updateData: any = {
                              price: amountPaid,
                              trxId,
                              currentPeriodStart: formatUnixToIsoUtc(subscription.current_period_start),
                              currentPeriodEnd: formatUnixToIsoUtc(subscription.current_period_end),
                              remaining,
                              status: subscription.status === 'trialing' ? 'trialing' : 'active',
                              cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
                         };

                         // Add or update trial fields
                         if (subscription.status === 'trialing' && subscription.trial_start && subscription.trial_end) {
                              updateData.trialStart = formatUnixToIsoUtc(subscription.trial_start);
                              updateData.trialEnd = formatUnixToIsoUtc(subscription.trial_end);
                         } else {
                              // Clear trial fields if no longer in trial
                              updateData.trialStart = null;
                              updateData.trialEnd = null;
                         }

                         await Subscription.findByIdAndUpdate(
                              currentSubscription._id,
                              updateData,
                              { new: true },
                         );
                    }
               }

               // Update user status based on subscription status
               const userUpdateData: any = {
                    isSubscribed: true,
                    hasAccess: true,
                    packageName: pricingPlan.title,
               };

               // Check if subscription moved from trial to active (auto-renewal)
               if (subscription.status === 'active' && !subscription.trial_end) {
                    // Trial period ended, now it's a paid subscription (auto-renewal)
                    userUpdateData.isFreeTrial = false;
                    userUpdateData.trialExpireAt = null;
                    
                    console.log(`Auto-renewal completed for user ${existingUser.email}:`, {
                          subscriptionId: subscription.id,
                          previousStatus: 'trialing',
                          newStatus: 'active',
                          autoRenewal: true
                     });
                     
                     // Send auto-renewal success notification
                     await SubscriptionNotificationService.sendAutoRenewalSuccessNotification(
                          existingUser._id.toString(),
                          subscription.id
                     );
               } else if (subscription.status === 'trialing') {
                    // Check if user is eligible for trial (first-time only)
                    const hasUsedTrialBefore = await Subscription.findOne({
                         userId: existingUser._id,
                         _id: { $ne: currentSubscription?._id }, // Exclude current subscription
                         $or: [
                              { trialStart: { $exists: true, $ne: null } },
                              { status: 'trialing' }
                         ]
                    });
                    
                    if (!hasUsedTrialBefore) {
                         // First-time trial user
                         userUpdateData.isFreeTrial = true;
                         userUpdateData.trialExpireAt = new Date(subscription.trial_end! * 1000);
                    } else {
                         // User has used trial before, treat as regular subscription
                         userUpdateData.isFreeTrial = false;
                         userUpdateData.trialExpireAt = null;
                         
                         console.log(`Trial denied for user ${existingUser.email} - already used trial before`);
                    }
               } else {
                    // Regular active subscription or other status
                    userUpdateData.isFreeTrial = false;
                    userUpdateData.trialExpireAt = null;
               }

               await User.findByIdAndUpdate(
                    existingUser._id,
                    userUpdateData,
                    { new: true },
               );
          } else {
               throw new AppError(StatusCodes.BAD_REQUEST, 'No email found for the customer!');
          }
     } catch (error) {
          if (error instanceof AppError) {
               throw error;
          } else {
               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error updating subscription status');
          }
     }
};

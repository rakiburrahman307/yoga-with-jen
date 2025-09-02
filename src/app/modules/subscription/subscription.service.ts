import { Package } from '../package/package.model';
import { ISubscription } from './subscription.interface';
import { Subscription } from './subscription.model';
import stripe from '../../../config/stripe';
import { User } from '../user/user.model';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import config from '../../../config';
import { checkUserTrialStatus, TrialStatus } from '../../../helpers/subscription/checkTrialStatus';
import { SubscriptionNotificationService } from './subscription.notification';

const subscriptionDetailsFromDB = async (id: string): Promise<{ subscription: ISubscription | object }> => {
     const subscription = await Subscription.findOne({ userId: id }).populate('package', 'title credit duration').lean();

     if (!subscription) {
          return { subscription: {} }; // Return empty object if no subscription found
     }

     const subscriptionFromStripe = await stripe.subscriptions.retrieve(subscription.subscriptionId);

     // Check subscription status and update database accordingly
     if (subscriptionFromStripe?.status !== 'active' && subscriptionFromStripe?.status !== 'trialing') {
          await Promise.all([User.findByIdAndUpdate(id, { isSubscribed: false }, { new: true }), Subscription.findOneAndUpdate({ user: id }, { status: 'expired' }, { new: true })]);
     }

     return { subscription };
};

const companySubscriptionDetailsFromDB = async (id: string): Promise<{ subscription: ISubscription | object }> => {
     const subscription = await Subscription.findOne({ userId: id }).populate('package', 'title credit').lean();
     if (!subscription) {
          return { subscription: {} }; // Return empty object if no subscription found
     }

     const subscriptionFromStripe = await stripe.subscriptions.retrieve(subscription.subscriptionId);

     // Check subscription status and update database accordingly
     if (subscriptionFromStripe?.status !== 'active' && subscriptionFromStripe?.status !== 'trialing') {
          await Promise.all([User.findByIdAndUpdate(id, { isSubscribed: false }, { new: true }), Subscription.findOneAndUpdate({ user: id }, { status: 'expired' }, { new: true })]);
     }

     return { subscription };
};

const subscriptionsFromDB = async (query: Record<string, unknown>): Promise<ISubscription[]> => {
     const conditions: any[] = [];
     const { searchTerm, limit, page, paymentType } = query;
     if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
          const trimmedSearchTerm = searchTerm.trim();
          const matchingPackageIds = await Package.find({
               $or: [{ title: { $regex: trimmedSearchTerm, $options: 'i' } }, { paymentType: { $regex: trimmedSearchTerm, $options: 'i' } }],
          }).distinct('_id');
          const matchingUserIds = await User.find({
               $or: [
                    { email: { $regex: trimmedSearchTerm, $options: 'i' } },
                    { name: { $regex: trimmedSearchTerm, $options: 'i' } },
                    { company: { $regex: trimmedSearchTerm, $options: 'i' } },
                    { contact: { $regex: trimmedSearchTerm, $options: 'i' } },
               ],
          }).distinct('_id');
          const searchConditions = [];

          if (matchingPackageIds.length > 0) {
               searchConditions.push({ package: { $in: matchingPackageIds } });
          }

          if (matchingUserIds.length > 0) {
               searchConditions.push({ userId: { $in: matchingUserIds } });
          }
          if (searchConditions.length > 0) {
               conditions.push({ $or: searchConditions });
          } else {
               return {
                    data: [],
                    meta: {
                         page: parseInt(page as string) || 1,
                         total: 0,
                    },
               } as any;
          }
     }

     // Handle payment type filter
     if (paymentType && typeof paymentType === 'string' && paymentType.trim()) {
          const packageIdsWithPaymentType = await Package.find({
               paymentType: paymentType.trim(),
          }).distinct('_id');

          if (packageIdsWithPaymentType.length > 0) {
               conditions.push({ package: { $in: packageIdsWithPaymentType } });
          } else {
               // If no packages match the payment type, return empty result
               return {
                    data: [],
                    meta: {
                         page: parseInt(page as string) || 1,
                         total: 0,
                    },
               } as any;
          }
     }

     // Build final query conditions
     const whereConditions = conditions.length > 0 ? { $and: conditions } : {};

     // Pagination
     const pages = Math.max(1, parseInt(page as string) || 1);
     const size = Math.max(1, Math.min(100, parseInt(limit as string) || 10)); // Limit max size
     const skip = (pages - 1) * size;

     try {
          // Execute query with population
          const result = await Subscription.find(whereConditions)
               .populate([
                    {
                         path: 'package',
                         select: 'title paymentType credit description',
                    },
                    {
                         path: 'userId',
                         select: 'email name linkedIn contact company website',
                    },
               ])
               .select('userId package price trxId currentPeriodStart currentPeriodEnd status createdAt updatedAt')
               .sort({ createdAt: -1 }) // Add sorting by creation date
               .skip(skip)
               .limit(size)
               .lean(); // Use lean() for better performance

          // Get total count for pagination
          const count = await Subscription.countDocuments(whereConditions);

          const data: any = {
               data: result,
               meta: {
                    page: pages,
                    limit: size,
                    total: count,
                    totalPages: Math.ceil(count / size),
               },
          };

          return data;
     } catch (error) {
          console.error('Error fetching subscriptions:', error);
          throw new Error('Failed to fetch subscriptions');
     }
};
const createSubscriptionCheckoutSession = async (userId: string, packageId: string) => {
     const isExistPackage = await Package.findOne({
          _id: packageId,
          status: 'active',
     });
     if (!isExistPackage) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');
     }
     const user = await User.findById(userId).select('+stripeCustomerId');
     if (!user || !user.stripeCustomerId) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User or Stripe Customer ID not found');
     }

     // Check if user has already used their free trial (first-time trial only)
     const hasUsedTrial = await Subscription.findOne({
          userId,
          $or: [
               { trialStart: { $exists: true, $ne: null } },
               { status: 'trialing' }
          ]
     });

     // Prepare subscription data based on trial eligibility
     const subscriptionData: any = {
          metadata: {
               userId: String(userId),
               packageId: String(isExistPackage._id),
               isFirstTimeUser: hasUsedTrial ? 'false' : 'true'
          },
     };

     // Only add trial period for first-time users
     if (!hasUsedTrial) {
          subscriptionData.trial_period_days = 7;
     }

     // Convert Mongoose String types to primitive strings
     const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          customer: String(user.stripeCustomerId),
          line_items: [
               {
                    price: String(isExistPackage.priceId),
                    quantity: 1,
               },
          ],
          subscription_data: subscriptionData,
          metadata: {
               userId: String(userId),
               subscriptionId: String(isExistPackage._id),
               hasUsedTrial: hasUsedTrial ? 'true' : 'false'
          },
          // your backend url for success and cancel
          success_url: `${config.backend_url || 'http://10.0.60.126:7000'}/api/v1/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${config.backend_url || 'http://10.0.60.126:7000'}/subscription/cancel`,
     });
     return {
          url: session.url,
          sessionId: session.id,
          isFirstTimeUser: !hasUsedTrial
     };
};

const upgradeSubscriptionToDB = async (userId: string, packageId: string) => {
     const activeSubscription = await Subscription.findOne({
          userId,
          status: { $in: ['active', 'trialing'] },
     });

     if (!activeSubscription || !activeSubscription.subscriptionId) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'No active subscription found to upgrade');
     }

     const packageDoc = await Package.findById(packageId);

     if (!packageDoc || !packageDoc.priceId) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Package not found or missing Stripe Price ID');
     }

     const user = await User.findById(userId).select('+stripeCustomerId');

     if (!user || !user.stripeCustomerId) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User or Stripe Customer ID not found');
     }

     const stripeSubscription = await stripe.subscriptions.retrieve(activeSubscription.subscriptionId);
     console.log(stripeSubscription, 'this is stripe subscription existing');

     await stripe.subscriptions.update(activeSubscription.subscriptionId, {
          items: [
               {
                    id: stripeSubscription.items.data[0].id,
                    price: packageDoc.priceId,
               },
          ],
          proration_behavior: 'create_prorations',
          metadata: {
               userId,
               packageId: packageDoc._id.toString(),
          },
     });
     console.log(' thsi is stripe subscription updated');
     const portalSession = await stripe.billingPortal.sessions.create({
          customer: user.stripeCustomerId,
          return_url: config.frontend_url,
          flow_data: {
               type: 'subscription_update',
               subscription_update: {
                    subscription: activeSubscription.subscriptionId,
               },
          },
     });

     return {
          url: portalSession.url,
     };
};
const cancelSubscriptionToDB = async (userId: string) => {
     const activeSubscription = await Subscription.findOne({
          userId,
          status: { $in: ['active', 'trialing'] },
     });
     if (!activeSubscription || !activeSubscription.subscriptionId) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No active subscription found to cancel');
     }

     await stripe.subscriptions.cancel(activeSubscription.subscriptionId);

     await Subscription.findOneAndUpdate({ userId, status: { $in: ['active', 'trialing'] } }, { status: 'cancel' }, { new: true });

     return { success: true, message: 'Subscription canceled successfully' };
};
const successMessage = async (id: string) => {
     const session = await stripe.checkout.sessions.retrieve(id);
     return session;
};

const getUserTrialStatus = async (userId: string): Promise<TrialStatus> => {
     return await checkUserTrialStatus(userId);
};

const checkSubscriptionAccess = async (userId: string) => {
     const user = await User.findById(userId);
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
     }

     const trialStatus = await checkUserTrialStatus(userId);

     // Check if user has access (either active subscription or valid trial)
     const hasAccess = user.hasAccess && (trialStatus.hasActiveSubscription || trialStatus.isInTrial);

     return {
          hasAccess,
          isSubscribed: user.isSubscribed,
          trialStatus,
          packageName: user.packageName,
     };
};



// Handle subscription expiry
const handleSubscriptionExpiry = async (userId: string) => {
     try {
          // Find expired subscriptions
          const expiredSubscriptions = await Subscription.find({
               userId,
               status: { $in: ['active', 'trialing'] },
               currentPeriodEnd: { $lt: new Date().toISOString() }
          });

          if (expiredSubscriptions.length > 0) {
               // Update subscription status to expired
               await Subscription.updateMany(
                    {
                         userId,
                         status: { $in: ['active', 'trialing'] },
                         currentPeriodEnd: { $lt: new Date().toISOString() }
                    },
                    { status: 'expired' }
               );

               // Send expiry notification to user
               await SubscriptionNotificationService.sendSubscriptionExpiryNotification(userId);

               // Update user access
               await User.findByIdAndUpdate(userId, {
                    hasAccess: false,
                    isSubscribed: false,
                    isFreeTrial: false
               });

               return {
                    success: true,
                    message: 'Subscription expired and access revoked',
                    expiredCount: expiredSubscriptions.length
               };
          }

          return {
               success: true,
               message: 'No expired subscriptions found'
          };
     } catch (error) {
          console.error('Subscription expiry handling error:', error);
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to handle subscription expiry');
     }
};


// Unified subscription handler - handles both new subscription and renewal
const createOrRenewSubscription = async (userId: string, packageId: string) => {
     const user = await User.findById(userId).select('+stripeCustomerId');
     if (!user || !user.stripeCustomerId) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User or Stripe Customer ID not found');
     }

     const targetPackage = await Package.findOne({
          _id: packageId,
          status: 'active',
     });
     if (!targetPackage) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');
     }

     // Check if user has any existing subscription
     const existingSubscription = await Subscription.findOne({
          userId,
          status: { $in: ['active', 'trialing', 'past_due'] }
     });

     // Check if user has ever used trial before
     const hasUsedTrial = await Subscription.findOne({
          userId,
          $or: [
               { trialStart: { $exists: true, $ne: null } },
               { status: 'trialing' }
          ]
     });

     const sessionData: any = {
          mode: 'subscription',
          customer: String(user.stripeCustomerId),
          line_items: [
               {
                    price: String(targetPackage.priceId),
                    quantity: 1,
               },
          ],
          success_url: `${config.backend_url || 'http://10.0.60.126:7000'}/api/v1/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${config.backend_url || 'http://10.0.60.126:7000'}/subscription/cancel`,
     };

     // Determine subscription type and metadata
     let subscriptionType = 'new';
     let isEligibleForTrial = false;

     if (existingSubscription) {
          // User has existing subscription - this is a renewal or package change
          subscriptionType = existingSubscription.package.toString() === packageId ? 'renewal' : 'package_change';

          // Cancel existing subscription if it's a package change
          if (subscriptionType === 'package_change') {
               try {
                    await stripe.subscriptions.cancel(String(existingSubscription.subscriptionId))
               } catch (error: any) {
                    console.error('Error cancelling existing subscription:', error.message);
               }
          }
     } else {
          isEligibleForTrial = !hasUsedTrial;
     }

     // Set up subscription data
     const subscriptionMetadata = {
          userId: String(userId),
          packageId: String(targetPackage._id),
          subscriptionType,
          isFirstTimeUser: isEligibleForTrial ? 'true' : 'false',
          ...(existingSubscription && { previousSubscriptionId: String(existingSubscription._id) })
     };

     sessionData.subscription_data = {
          metadata: subscriptionMetadata,
     };

     // Add trial only for first-time users
     if (isEligibleForTrial) {
          sessionData.subscription_data.trial_period_days = 7;
          console.log(`Granting 7-day trial to first-time user: ${user.email}`);
     } else {
          console.log(`No trial for user: ${user.email} - ${subscriptionType} subscription`);
     }

     sessionData.metadata = {
          userId: String(userId),
          subscriptionId: String(targetPackage._id),
          subscriptionType,
          hasUsedTrial: hasUsedTrial ? 'true' : 'false'
     };

     try {
          const session = await stripe.checkout.sessions.create(sessionData);

          console.log(`Subscription session created for user ${user.email}:`, {
               sessionId: session.id,
               subscriptionType,
               packageName: targetPackage.title,
               hasTrialBenefit: isEligibleForTrial
          });

          return {
               url: session.url,
               sessionId: session.id,
               subscriptionType,
               isFirstTimeUser: isEligibleForTrial,
               packageName: targetPackage.title,
               message: subscriptionType === 'new'
                    ? (isEligibleForTrial ? 'New subscription with 7-day free trial created' : 'New subscription created')
                    : subscriptionType === 'renewal'
                         ? 'Subscription renewal initiated'
                         : 'Package change initiated'
          };
     } catch (error: any) {
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, `Failed to create subscription: ${error.message}`);
     }
};

// Get user transaction history
const getTransactionHistory = async (userId: string): Promise<any> => {
     try {
          const transactions = await Subscription.find({ userId })
               .populate('package', 'title paymentType credit duration')
               .select('package price trxId currentPeriodStart currentPeriodEnd status createdAt trialStart trialEnd')
               .sort({ createdAt: -1 })
               .lean();

          const formattedTransactions = transactions.map((transaction: any) => ({
               id: transaction._id,
               packageName: transaction.package?.title || 'Unknown Package',
               paymentType: transaction.package?.paymentType || 'Unknown',
               amount: transaction.price || 0,
               transactionId: transaction.trxId,
               subscriptionPeriod: {
                    start: transaction.currentPeriodStart,
                    end: transaction.currentPeriodEnd,
               },
               status: transaction.status,
               isTrialPeriod: transaction.trialStart && transaction.trialEnd ? true : false,
               trialPeriod: transaction.trialStart && transaction.trialEnd ? {
                    start: transaction.trialStart,
                    end: transaction.trialEnd,
               } : null,
               createdAt: transaction.createdAt,
          }));

          return {
               transactions: formattedTransactions,
               totalTransactions: formattedTransactions.length,
          };
     } catch (error) {
          console.error('Error fetching transaction history:', error);
          throw new Error('Failed to fetch transaction history');
     }
};

export const SubscriptionService = {
     subscriptionDetailsFromDB,
     subscriptionsFromDB,
     companySubscriptionDetailsFromDB,
     createSubscriptionCheckoutSession,
     upgradeSubscriptionToDB,
     cancelSubscriptionToDB,
     successMessage,
     getUserTrialStatus,
     checkSubscriptionAccess,
     handleSubscriptionExpiry,
     createOrRenewSubscription,
     getTransactionHistory,
};

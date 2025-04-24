import { Package } from '../package/package.model';
import { ISubscription } from './subscription.interface';
import { Subscription } from './subscription.model';
import stripe from '../../../config/stripe';
import { User } from '../user/user.model';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import config from '../../../config';

const subscriptionDetailsFromDB = async (
  id: string,
): Promise<{ subscription: ISubscription | {} }> => {
  const subscription = await Subscription.findOne({ userId: id })
    .populate('package', 'title credit')
    .lean();

  if (!subscription) {
    return { subscription: {} }; // Return empty object if no subscription found
  }

  const subscriptionFromStripe = await stripe.subscriptions.retrieve(
    subscription.subscriptionId,
  );

  // Check subscription status and update database accordingly
  if (subscriptionFromStripe?.status !== 'active') {
    await Promise.all([
      User.findByIdAndUpdate(id, { isSubscribed: false }, { new: true }),
      Subscription.findOneAndUpdate(
        { user: id },
        { status: 'expired' },
        { new: true },
      ),
    ]);
  }

  return { subscription };
};

const companySubscriptionDetailsFromDB = async (
  id: string,
): Promise<{ subscription: ISubscription | {} }> => {
  const subscription = await Subscription.findOne({ userId: id })
    .populate('package', 'title credit')
    .lean();
  if (!subscription) {
    return { subscription: {} }; // Return empty object if no subscription found
  }

  const subscriptionFromStripe = await stripe.subscriptions.retrieve(
    subscription.subscriptionId,
  );

  // Check subscription status and update database accordingly
  if (subscriptionFromStripe?.status !== 'active') {
    await Promise.all([
      User.findByIdAndUpdate(id, { isSubscribed: false }, { new: true }),
      Subscription.findOneAndUpdate(
        { user: id },
        { status: 'expired' },
        { new: true },
      ),
    ]);
  }

  return { subscription };
};

const subscriptionsFromDB = async (
  query: Record<string, unknown>,
): Promise<ISubscription[]> => {
  const anyConditions: any[] = [];

  const { search, limit, page, paymentType } = query;

  if (search) {
    const matchingPackageIds = await Package.find({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { paymentType: { $regex: search, $options: 'i' } },
      ],
    }).distinct('_id');

    if (matchingPackageIds.length) {
      anyConditions.push({
        package: { $in: matchingPackageIds },
      });
    }
  }

  if (paymentType) {
    anyConditions.push({
      package: {
        $in: await Package.find({ paymentType: paymentType }).distinct('_id'),
      },
    });
  }

  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const result = await Subscription.find(whereConditions)
    .populate([
      {
        path: 'package',
        select: 'title paymentType credit description',
      },
      {
        path: 'userId',
        select: 'email name linkedIn contact company website ',
      },
    ])
    .select(
      'userId package price trxId currentPeriodStart currentPeriodEnd status',
    )
    .skip(skip)
    .limit(size);

  const count = await Subscription.countDocuments(whereConditions);

  const data: any = {
    data: result,
    meta: {
      page: pages,
      total: count,
    },
  };

  return data;
};
const createSubscriptionCheckoutSession = async (
  userId: string,
  packageId: string,
) => {
  const isExistPackage = await Package.findOne({
    _id: packageId,
    status: 'active',
  });
  if (!isExistPackage) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');
  }
  const user = await User.findById(userId).select('+stripeCustomerId');
  if (!user || !user.stripeCustomerId) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'User or Stripe Customer ID not found',
    );
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
    metadata: {
      userId: String(userId),
      subscriptionId: String(isExistPackage._id),
    },
    success_url: `${config.frontend_url}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/subscription/cancel`,
  });
  return {
    url: session.url,
    sessionId: session.id,
  };
};

const upgradeSubscriptionToDB = async (userId: string, packageId: string) => {
  const activeSubscription = await Subscription.findOne({
    userId,
    status: 'active',
  });

  if (!activeSubscription || !activeSubscription.subscriptionId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'No active subscription found to upgrade',
    );
  }

  const packageDoc = await Package.findById(packageId);

  if (!packageDoc || !packageDoc.priceId) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'Package not found or missing Stripe Price ID',
    );
  }

  const user = await User.findById(userId).select('+stripeCustomerId');

  if (!user || !user.stripeCustomerId) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'User or Stripe Customer ID not found',
    );
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(
    activeSubscription.subscriptionId,
  );
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
    user: userId,
    status: 'active',
  });
  if (!activeSubscription || !activeSubscription.subscriptionId) {
    throw new Error('No active subscription found to cancel');
  }

  await stripe.subscriptions.cancel(activeSubscription.subscriptionId);

  await Subscription.findOneAndUpdate(
    { user: userId, status: 'active' },
    { status: 'canceled' },
    { new: true },
  );

  return { success: true, message: 'Subscription canceled successfully' };
};
export const SubscriptionService = {
  subscriptionDetailsFromDB,
  subscriptionsFromDB,
  companySubscriptionDetailsFromDB,
  createSubscriptionCheckoutSession,
  upgradeSubscriptionToDB,
  cancelSubscriptionToDB,
};

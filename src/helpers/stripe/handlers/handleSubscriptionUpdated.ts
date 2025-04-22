import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import stripe from '../../../config/stripe';
import AppError from '../../../errors/AppError';
import { User } from '../../../app/modules/user/user.model';
import { Package } from '../../../app/modules/package/package.model';
import { Subscription } from '../../../app/modules/subscription/subscription.model';

export const handleSubscriptionUpdated = async (data: Stripe.Subscription) => {
  try {
    // Retrieve the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(data.id);

    // Retrieve the customer associated with the subscription
    const customer = (await stripe.customers.retrieve(
      subscription.customer as string,
    )) as Stripe.Customer;

    // Extract price ID from subscription items
    const priceId = subscription.items.data[0]?.price?.id;

    // Retrieve the invoice to get the transaction ID and amount paid
    const invoice = await stripe.invoices.retrieve(
      subscription.latest_invoice as string,
    );

    const trxId = invoice?.payment_intent;
    const amountPaid = invoice?.total / 100;

    if (customer?.email) {
      // Find the user by email
      const existingUser = await User.findOne({ email: customer?.email });

      if (!existingUser) {
        throw new AppError(
          StatusCodes.NOT_FOUND,
          `User not found for email: ${customer?.email}`,
        );
      }

      // Find the pricing plan by priceId
      const pricingPlan = await Package.findOne({ priceId });

      if (!pricingPlan) {
        throw new AppError(
          StatusCodes.NOT_FOUND,
          `Pricing plan with Price ID: ${priceId} not found!`,
        );
      }

      // Find the current active subscription and populate the package field
      const currentActiveSubscription = await Subscription.findOne({
        userId: existingUser._id,
        status: 'active',
      }).populate('package'); // Make sure the package is populated

      if (currentActiveSubscription) {
        console.log('currentActiveSubscription', currentActiveSubscription);

        // Check if the priceId has changed
        if (
          String((currentActiveSubscription.package as any).priceId) !== priceId
        ) {
          // Deactivate the old subscription
          await Subscription.findByIdAndUpdate(
            currentActiveSubscription._id,
            { status: 'deactivated' },
            { new: true },
          );

          // Create a new subscription
          const newSubscription = new Subscription({
            userId: existingUser._id,
            customerId: customer.id,
            packageId: pricingPlan._id,
            status: 'active',
            trxId,
            amountPaid,
          });

          await newSubscription.save();
          console.log('New subscription created.');
        }
      } else {
        // If no active subscription found, check for a deactivated one
        const deactivatedSubscription = await Subscription.findOne({
          userId: existingUser._id,
          status: 'deactivated',
        });

        if (deactivatedSubscription) {
          // Reactivate the deactivated subscription
          await Subscription.findByIdAndUpdate(
            deactivatedSubscription._id,
            { status: 'active' },
            { new: true },
          );
        } else {
          // Create a new subscription if no deactivated subscription exists
          const newSubscription = new Subscription({
            userId: existingUser._id,
            customerId: customer.id,
            packageId: pricingPlan._id,
            status: 'active',
            trxId,
            amountPaid,
          });

          await newSubscription.save();
          console.log('New subscription created.');
        }
      }
    } else {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'No email found for the customer!',
      );
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
    if (error instanceof AppError) {
      throw error; // Rethrow custom application errors
    } else {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Error updating subscription status',
      );
    }
  }
};

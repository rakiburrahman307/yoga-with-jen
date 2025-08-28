import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import stripe from '../../../config/stripe';
import AppError from '../../../errors/AppError';
import { User } from '../../../app/modules/user/user.model';
import { Package } from '../../../app/modules/package/package.model';

export const handleTrialWillEnd = async (data: Stripe.Subscription) => {
     try {
          // Retrieve the subscription from Stripe
          const subscription = await stripe.subscriptions.retrieve(data.id);
          const customer = (await stripe.customers.retrieve(subscription.customer as string)) as Stripe.Customer;

          if (customer?.email) {
               const existingUser = await User.findOne({ email: customer?.email });

               if (!existingUser) {
                    throw new AppError(StatusCodes.NOT_FOUND, `User not found for email: ${customer?.email}`);
               }

               const priceId = subscription.items.data[0]?.price?.id;
               const pricingPlan = await Package.findOne({ priceId });
               if (!pricingPlan) {
                    throw new AppError(StatusCodes.NOT_FOUND, `Pricing plan with Price ID: ${priceId} not found!`);
               }
               await User.findByIdAndUpdate(
                    existingUser._id,
                    {
                         isFreeTrial: true,
                         trialExpireAt: new Date(subscription.trial_end! * 1000),
                         // You can add additional fields here for trial ending notifications
                    },
                    { new: true },
               );

               // Optional: Send notification to user about trial ending
               // You can implement email notification or in-app notification here
               console.log(`Trial will end for user ${existingUser.email} on ${new Date(subscription.trial_end! * 1000)}`);

          } else {
               throw new AppError(StatusCodes.BAD_REQUEST, 'No email found for the customer!');
          }
     } catch (error) {
          if (error instanceof AppError) {
               throw error;
          } else {
               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error handling trial will end event');
          }
     }
};
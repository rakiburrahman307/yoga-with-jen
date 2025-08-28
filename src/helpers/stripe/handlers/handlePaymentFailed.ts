import { Request, Response } from 'express';
import { User } from '../../../app/modules/user/user.model';
import { Subscription } from '../../../app/modules/subscription/subscription.model';
import { SubscriptionNotificationService } from '../../../app/modules/subscription/subscription.notification';
import { StatusCodes } from 'http-status-codes';
import stripe from '../../../config/stripe';
import Stripe from 'stripe';


export const handlePaymentFailed = async (req: Request, res: Response) => {
     try {
          const event = req.body as Stripe.Event;
          const invoice = event.data.object as Stripe.Invoice;

          console.log('Processing payment failed event:', {
               invoiceId: invoice.id,
               customerId: invoice.customer,
               subscriptionId: invoice.subscription,
               attemptCount: invoice.attempt_count,
               nextPaymentAttempt: invoice.next_payment_attempt
          });

          // Get customer details from Stripe
          const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
          if (customer === null || customer.deleted) {
               console.error('Customer not found or deleted:', invoice.customer);
               return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Customer not found' });
          }

          // Find user by customer email
          const user = await User.findOne({ email: customer.email });
          if (!user) {
               console.error('User not found for customer email:', customer.email);
               return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
          }

          // Find the subscription
          const subscription = await Subscription.findOne({
               subscriptionId: invoice.subscription as string,
               status: { $in: ['active', 'trialing', 'past_due'] }
          });

          if (!subscription) {
               console.error('Subscription not found:', invoice.subscription);
               return res.status(StatusCodes.NOT_FOUND).json({ error: 'Subscription not found' });
          }

          // Update subscription status to past_due
          await Subscription.findByIdAndUpdate(subscription._id, {
               status: 'past_due',
               updatedAt: new Date()
          });

          // Update user access based on payment failure
          const userUpdateData: any = {
               hasAccess: false, // Revoke access on payment failure
               updatedAt: new Date()
          };

          // If this is the final attempt and payment still failed
          if (invoice.attempt_count >= 4 || !invoice.next_payment_attempt) {
               userUpdateData.isSubscribed = false;
               console.log(`Final payment attempt failed for user ${user.email} - revoking subscription`);
          }

          await User.findByIdAndUpdate(user._id, userUpdateData);

          // Send payment failure notification
          const failureReason = invoice.last_finalization_error?.message || 'Payment method declined';
          await SubscriptionNotificationService.sendPaymentFailureNotification(
               user._id.toString(),
               failureReason
          );

          console.log(`Payment failure handled for user ${user.email}:`, {
               subscriptionId: subscription.subscriptionId,
               attemptCount: invoice.attempt_count,
               finalAttempt: !invoice.next_payment_attempt,
               accessRevoked: true
          });

          res.status(StatusCodes.OK).json({ 
               success: true, 
               message: 'Payment failure handled successfully' 
          });

     } catch (error: any) {
          console.error('Error handling payment failed event:', error);
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
               error: 'Failed to handle payment failure',
               details: error.message 
          });
     }
};

// Handle invoice payment action required (for 3D Secure, etc.)
export const handleInvoicePaymentActionRequired = async (req: Request, res: Response) => {
     try {
          const event = req.body as Stripe.Event;
          const invoice = event.data.object as Stripe.Invoice;

          console.log('Processing payment action required event:', {
               invoiceId: invoice.id,
               customerId: invoice.customer,
               subscriptionId: invoice.subscription
          });

          // Get customer details
          const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
          if (customer === null || customer.deleted) {
               return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Customer not found' });
          }

          // Find user
          const user = await User.findOne({ email: customer.email });
          if (!user) {
               return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
          }

     } catch (error: any) {
          console.error('Error handling payment action required event:', error);
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
               error: 'Failed to handle payment action required',
               details: error.message 
          });
     }
};
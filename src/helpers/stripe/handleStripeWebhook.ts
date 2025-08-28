import { Request, Response } from 'express';
import Stripe from 'stripe';
import colors from 'colors';
import { handleSubscriptionCreated, handleSubscriptionDeleted, handleSubscriptionUpdated, handleTrialWillEnd } from './handlers';
import { handlePaymentFailed, handleInvoicePaymentActionRequired } from './handlers/handlePaymentFailed';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../../shared/logger';
import config from '../../config';
import stripe from '../../config/stripe';

const handleStripeWebhook = async (req: Request, res: Response) => {
     try {
          // Extract Stripe signature and webhook secret
          const signature = req.headers['stripe-signature'] as string;
          const webhookSecret = config.stripe.stripe_webhook_secret as string;

          let event: Stripe.Event | undefined;

          // Verify the event signature
          try {
               event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
          } catch (error) {
               logger.error(colors.red(`Webhook signature verification failed: ${error}`));
               res.status(StatusCodes.BAD_REQUEST).json({ 
                    error: 'Webhook signature verification failed' 
               });
               return;
          }

          // Check if the event is valid
          if (!event) {
               logger.error(colors.red('Invalid event received'));
               res.status(StatusCodes.BAD_REQUEST).json({ 
                    error: 'Invalid event received' 
               });
               return;
          }

          // Log the received event
          logger.info(colors.blue(`Received webhook event: ${event.type} [${event.id}]`));

          // Extract event data and type
          const data = event.data.object as Stripe.Subscription | Stripe.Account;
          const eventType = event.type;
          
          // Handle the event based on its type
          try {
               switch (eventType) {
                    case 'customer.subscription.created':
                         await handleSubscriptionCreated(data as Stripe.Subscription);
                         break;

                    case 'customer.subscription.updated':
                         await handleSubscriptionUpdated(data as Stripe.Subscription);
                         break;

                    case 'customer.subscription.deleted':
                         await handleSubscriptionDeleted(data as Stripe.Subscription);
                         break;

                    case 'customer.subscription.trial_will_end':
                         await handleTrialWillEnd(data as Stripe.Subscription);
                         break;

                    case 'invoice.payment_failed':
                         await handlePaymentFailed(req, res);
                         return;

                    case 'invoice.payment_action_required':
                         await handleInvoicePaymentActionRequired(req, res);
                         return; 

                    default:
                         logger.warn(colors.yellow(`Unhandled event type: ${eventType}`));
               }
               
               logger.info(colors.green(`Successfully processed webhook event: ${eventType} [${event.id}]`));
          } catch (error) {
               logger.error(colors.red(`Error handling event ${eventType}: ${error}`));
          }

          res.sendStatus(200);
     } catch (error) {
          logger.error(colors.red(`Webhook handler error: ${error}`));
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
               error: 'Internal server error' 
          });
     }
};

export default handleStripeWebhook;

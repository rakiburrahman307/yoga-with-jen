import cron from 'node-cron';
import { User } from '../app/modules/user/user.model';
import { emailHelper } from '../helpers/emailHelper';
import { emailTemplate } from '../shared/emailTemplate';
import { sendNotifications } from '../helpers/notificationsHelper';
import { Notification } from '../app/modules/notification/notification.model';

// ====== CRON JOB SCHEDULERS ======

// 1. Check for users expiring in 24 hours (send warning email)
const scheduleTrialWarningCheck = () => {
     // Run every day at 9:00 AM '0 9 * * *'
     cron.schedule('*/1 * * * *', async () => {
          try {
               console.log('🔔 Checking for trials expiring in 24 hours...');

               const tomorrow = new Date();
               tomorrow.setDate(tomorrow.getDate() + 1);
               tomorrow.setHours(23, 59, 59, 999); // End of tomorrow

               const today = new Date();
               today.setHours(23, 59, 59, 999); // End of today

               // Find users whose trial expires tomorrow
               const usersExpiringTomorrow = await User.find({
                    isFreeTrial: true,
                    hasAccess: true,
                    trialExpireAt: {
                         $gte: today,
                         $lte: tomorrow,
                    },
               });

               console.log(`📧 Found ${usersExpiringTomorrow.length} users expiring tomorrow`);

               // Send warning emails
               for (const user of usersExpiringTomorrow) {
                    const trialWarning = emailTemplate.sendTrialWarningEmail(user);
                    await emailHelper.sendEmail(trialWarning);
                    await sendNotifications({
                         title: `Your Free Trial Expires Tomorrow! ⏰`,
                         receiver: user._id,
                         message: `Your free trial will expire tomorrow at ${user.trialExpireAt.toLocaleString()}.`,
                         type: 'MESSAGE',
                    });
                    // Mark user as warned (add field to schema if needed)
                    await User.findByIdAndUpdate(user._id, {
                         trialWarningSent: true,
                    });
               }

               console.log('✅ Trial warning emails sent');
          } catch (error) {
               console.error('❌ Error in trial warning check:', error);
          }
     });
};

// 2. Check for expired trials every hour
const scheduleTrialExpiryCheck = () => {
     // Run every hour '0 * * * *'
     cron.schedule('*/1 * * * *', async () => {
          try {
               console.log('⏰ Checking for expired free trials...');

               const now = new Date();

               // Find users whose trial has expired
               const expiredUsers = await User.find({
                    isFreeTrial: true,
                    trialExpireAt: { $lt: now },
               });

               if (expiredUsers.length > 0) {
                    console.log(`🚫 Found ${expiredUsers.length} expired trial users`);

                    // Update expired users
                    const updateResult = await User.updateMany(
                         {
                              isFreeTrial: true,
                              trialExpireAt: { $lt: now },
                         },
                         {
                              $set: {
                                   isFreeTrial: false,
                                   hasAccess: false,
                                   trialExpiredAt: now, // Track when trial expired
                              },
                              $inc: { tokenVersion: 1 },
                         },
                    );

                    // Send expiry emails
                    for (const user of expiredUsers) {
                         const trialExpiredEmail = emailTemplate.sendTrialExpiredEmail(user);
                         await emailHelper.sendEmail(trialExpiredEmail);
                         await sendNotifications({
                              title: `Your Free Trial Has Ended 😢`,
                              receiver: user._id,
                              message: `Your free trial has expired. But don't worry - you can still access all features by subscribing!`,
                              type: 'MESSAGE',
                         });
                    }

                    console.log(`✅ Updated ${updateResult.modifiedCount} expired users`);
               } else {
                    console.log('✅ No expired trials found');
               }
          } catch (error) {
               console.error('❌ Error in trial expiry check:', error);
          }
     });
};

// 3. Check for users expiring in 3 days (early warning)
const scheduleEarlyWarningCheck = () => {
     // Run every day at 10:00 AM '0 10 * * *'
     cron.schedule('*/1 * * * *', async () => {
          try {
               console.log('🔔 Checking for trials expiring in 3 days...');

               const threeDaysFromNow = new Date();
               threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
               threeDaysFromNow.setHours(23, 59, 59, 999);

               const twoDaysFromNow = new Date();
               twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
               twoDaysFromNow.setHours(23, 59, 59, 999);

               // Find users whose trial expires in 3 days
               const usersExpiringIn3Days = await User.find({
                    isFreeTrial: true,
                    hasAccess: true,
                    trialExpireAt: {
                         $gte: twoDaysFromNow,
                         $lte: threeDaysFromNow,
                    },
                    earlyWarningEmailSent: { $ne: true },
               });

               console.log(`📧 Found ${usersExpiringIn3Days.length} users expiring in 3 days`);

               for (const user of usersExpiringIn3Days) {
                    const EarlyWarningEmail = emailTemplate.sendEarlyWarningEmail(user);
                    await emailHelper.sendEmail(EarlyWarningEmail);
                    await sendNotifications({
                         title: `3 Days Left in Your Free Trial! 🚀`,
                         receiver: user._id,
                         message: `You have 3 days remaining in your free trial ${user.name}`,
                         type: 'MESSAGE',
                    });
                    await User.findByIdAndUpdate(user._id, {
                         earlyWarningEmailSent: true,
                    });
               }

               console.log('✅ Early warning emails sent');
          } catch (error) {
               console.error('❌ Error in early warning check:', error);
          }
     });
};

// ====== UTILITY FUNCTIONS ======

// Get trial statistics
const getTrialStatistics = async () => {
     const now = new Date();
     const tomorrow = new Date();
     tomorrow.setDate(tomorrow.getDate() + 1);

     const threeDaysFromNow = new Date();
     threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

     const stats = await Promise.all([
          User.countDocuments({ isFreeTrial: true, hasAccess: true }),
          User.countDocuments({
               isFreeTrial: true,
               trialExpireAt: { $lt: tomorrow, $gte: now },
          }),
          User.countDocuments({
               isFreeTrial: true,
               trialExpireAt: { $lt: threeDaysFromNow, $gte: now },
          }),
          User.countDocuments({
               isFreeTrial: false,
               hasAccess: false,
               trialExpiredAt: { $exists: true },
          }),
     ]);

     return {
          activeTrial: stats[0],
          expiringTomorrow: stats[1],
          expiringIn3Days: stats[2],
          expired: stats[3],
     };
};

// ====== MAIN SETUP FUNCTION ======
const startNotificationScheduler = () => {
     cron.schedule('* * * * *', async () => {
          const now = new Date();

          const pendingNotifications = await Notification.find({
               status: 'PENDING',
               sendAt: { $lte: now },
          });

          for (const notification of pendingNotifications) {
               try {
                    await sendNotifications(notification);
                    notification.status = 'SEND';
                    await notification.save();
               } catch (error) {
                    console.error('Error sending scheduled notification:', error);
                    // Optionally retry later or mark as failed
                    notification.status = 'FAILED'; // mark as failed on error
                    await notification.save();
               }
          }
     });
};
const setupTrialManagement = () => {
     console.log('🚀 Setting up trial management cron jobs...');

     // Start all cron jobs
     scheduleTrialExpiryCheck(); // Every hour
     scheduleTrialWarningCheck(); // Daily at 9 AM
     scheduleEarlyWarningCheck(); // Daily at 10 AM
     startNotificationScheduler(); // Every minute
     console.log('✅ All trial management jobs scheduled');

     // Log initial statistics
     getTrialStatistics().then((stats) => {
          console.log('📊 Initial Trial Statistics:', stats);
     });
};

export default setupTrialManagement;

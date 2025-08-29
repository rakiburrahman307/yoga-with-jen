import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { ScheduledNotification } from './scheduledNotification.model';
import AppError from '../../../errors/AppError';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { User } from '../user/user.model';
import { NotificationScheduleType, NotificationStatus, NotificationType, ReferenceModel } from './scheduledNotification.interface';
import { USER_ROLES } from '../../../enums/user';

// Updated admin function - stores only ONE scheduled notification
const adminSendNotificationFromDB = async (payload: any) => {
     const { title, message, receiver, sendAt, isScheduled } = payload;
     // Validate required fields
     if (!title || !message) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Title and message are required');
     }

     // Check if sendAt is provided and valid future date
     const hasValidSendAt = sendAt && !isNaN(new Date(sendAt).getTime()) && new Date(sendAt) > new Date();
     if (receiver) {
          const notification = new ScheduledNotification({
               title,
               referenceModel: ReferenceModel.MESSAGE,
               message,
               receiver: receiver,
               type: NotificationType.SYSTEM,
               sendAt: new Date(sendAt),
               notificationType: NotificationScheduleType.SCHEDULE,
               status: NotificationStatus.PENDING,
               isIndividual: true,
          });
          await notification.save();
     }
     if (sendAt) {
          if (hasValidSendAt) {
               // Schedule notification for specific receiver - store only ONE record
               const notification = new ScheduledNotification({
                    title,
                    referenceModel: ReferenceModel.MESSAGE,
                    message,
                    type: NotificationType.SYSTEM,
                    sendAt: new Date(sendAt),
                    notificationType: NotificationScheduleType.SCHEDULE,
                    status: NotificationStatus.PENDING,
               });
               await notification.save();
          }
     }

     if (!isScheduled) {
          // Schedule notification for specific receiver - store only ONE record
          const users = await User.find({ role: USER_ROLES.USER });
          if (users && users.length > 0) {
               // Process each user individually
               const notificationPromises = users.map(async (user) => {
                    const notificationData = {
                         title,
                         referenceModel: ReferenceModel.MESSAGE,
                         message,
                         type: NotificationType.SYSTEM,
                         notificationType: NotificationScheduleType.SCHEDULE,
                         status: NotificationStatus.SENT,
                         receiver: user._id,
                    };
                    // Send notification to individual user
                    return sendNotifications(notificationData);
               });

               // Wait for all notifications to be sent
               await Promise.all(notificationPromises);
          }
          try {
               console.log('first===========');
               const notification = new ScheduledNotification({
                    title,
                    referenceModel: ReferenceModel.MESSAGE,
                    message,
                    type: NotificationType.SYSTEM,
                    notificationType: NotificationScheduleType.INSTANT,
                    status: NotificationStatus.SENT,
               });
               await notification.save();
          } catch (error) {
               console.log(error);
          }
     }
};
const getAllPushNotification = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(ScheduledNotification.find({ notificationType: { $in: [NotificationScheduleType.INSTANT, NotificationScheduleType.SCHEDULE] } }), query);
     const result = await queryBuilder.fields().filter().paginate().sort().modelQuery.exec();
     const meta = await queryBuilder.countTotal();
     return {
          result,
          meta,
     };
};
export const ScheduledNotificationService = {
     adminSendNotificationFromDB,
     getAllPushNotification,
};

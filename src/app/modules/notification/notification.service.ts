import { JwtPayload } from 'jsonwebtoken';
import { INotification } from './notification.interface';
import { Notification } from './notification.model';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import AppError from '../../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enums/user';

// get notifications
const getNotificationFromDB = async (user: JwtPayload, query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(Notification.find({ receiver: user.id }).populate('receiver', 'name email phoneNumber'), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery.exec();
     const meta = await queryBuilder.countTotal();
     const unreadCount = await Notification.countDocuments({
          receiver: user.id,
          read: false,
     });

     const data: any = {
          result,
          meta,
          unreadCount,
     };

     return data;
};

// read notifications only for user
const readNotificationToDB = async (user: JwtPayload): Promise<INotification | undefined> => {
     const result: any = await Notification.updateMany({ receiver: user.id, read: false }, { $set: { read: true } });
     return result;
};
const readNotificationSingleToDB = async (id: string): Promise<INotification | undefined> => {
     const result: any = await Notification.findByIdAndUpdate(
          id,
          {
               $set: { read: true },
          },
          {
               new: true,
          },
     );
     return result;
};

// get notifications for admin
const adminNotificationFromDB = async (userId: string, query: Record<string, unknown>) => {
     const user = await User.findById(userId);
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Admin not found');
     }
     if (user.role === USER_ROLES.SUPER_ADMIN || user.role === USER_ROLES.ADMIN) {
          const querBuilder = new QueryBuilder(Notification.find({ receiver: user.id }), query).filter().sort().paginate().fields();
          const result = await querBuilder.modelQuery;
          const meta = await querBuilder.countTotal();
          return {
               result,
               meta,
          };
     }
};

// read notifications only for admin
const adminReadNotificationToDB = async (): Promise<INotification | null> => {
     const result: any = await Notification.updateMany({ type: 'ADMIN', read: false }, { $set: { read: true } }, { new: true });
     return result;
};
// const adminSendNotificationFromDB = async (payload: any) => {
//      const { title, message, receiver } = payload;

//      // Validate required fields
//      if (!title || !message) {
//           throw new AppError(StatusCodes.BAD_REQUEST, 'Title and message are required');
//      }

//      // Handle specific receiver if provided
//      if (receiver && typeof receiver === 'string') {
//           const notificationData = {
//                title,
//                referenceModel: 'MESSAGE',
//                text: message,
//                type: 'ADMIN',
//                receiver,
//           };
//           try {
//                await sendNotifications(notificationData);
//           } catch (error) {
//                throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error sending notification to receiver');
//           }
//      }

//      // Fetch users with role 'USER'
//      const users = await User.find({ role: 'USER' });
//      if (!users || users.length === 0) {
//           throw new AppError(StatusCodes.NOT_FOUND, 'No users found');
//      }

//      // Send notification to all users
//      const notificationPromises = users.map((user) => {
//           const notificationData = {
//                title,
//                referenceModel: 'MESSAGE',
//                text: message,
//                type: 'ADMIN',
//                receiver: user._id,
//           };
//           return sendNotifications(notificationData);
//      });

//      try {
//           await Promise.all(notificationPromises);
//      } catch (error) {
//           throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error sending notifications to users');
//      }

//      return;
// };

const adminSendNotificationFromDB = async (payload: any) => {
     const { title, message, receiver, sendAt } = payload;

     // Validate required fields
     if (!title || !message) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Title and message are required');
     }

     // Helper to save notification for scheduling
     const saveScheduledNotification = async (receiverId: string) => {
          const notification = new Notification({
               title,
               referenceModel: 'MESSAGE',
               text: message,
               type: 'ADMIN',
               receiver: receiverId,
               sendAt: new Date(sendAt),
               status: 'pending',
          });
          await notification.save();
     };

     // Check if sendAt is provided and valid future date
     const hasValidSendAt = sendAt && !isNaN(new Date(sendAt).getTime()) && new Date(sendAt) > new Date();

     if (receiver && typeof receiver === 'string') {
          if (hasValidSendAt) {
               // Schedule notification for specific receiver
               await saveScheduledNotification(receiver);
          } else {
               // Send immediately to specific receiver
               const notificationData = {
                    title,
                    referenceModel: 'MESSAGE',
                    text: message,
                    type: 'ADMIN',
                    receiver,
               };
               try {
                    await sendNotifications(notificationData);
               } catch (error) {
                    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error sending notification to receiver');
               }
          }
     } else {
          // If no specific receiver, get all users with role 'USER'
          const users = await User.find({ role: 'USER' });
          if (!users || users.length === 0) {
               throw new AppError(StatusCodes.NOT_FOUND, 'No users found');
          }

          if (hasValidSendAt) {
               // Schedule notifications for all users
               const savePromises = users.map((user: any) => saveScheduledNotification(user._id));
               await Promise.all(savePromises);
          } else {
               // Send notifications immediately to all users
               const notificationPromises = users.map((user) => {
                    const notificationData = {
                         title,
                         referenceModel: 'MESSAGE',
                         text: message,
                         type: 'ADMIN',
                         receiver: user._id,
                    };
                    return sendNotifications(notificationData);
               });

               try {
                    await Promise.all(notificationPromises);
               } catch (error) {
                    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error sending notifications to users');
               }
          }
     }
};

export default adminSendNotificationFromDB;

export const NotificationService = {
     adminNotificationFromDB,
     getNotificationFromDB,
     readNotificationToDB,
     adminReadNotificationToDB,
     adminSendNotificationFromDB,
     readNotificationSingleToDB,
};

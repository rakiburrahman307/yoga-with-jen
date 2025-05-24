import { JwtPayload } from 'jsonwebtoken';
import { INotification } from './notification.interface';
import { Notification } from './notification.model';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import AppError from '../../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';

// get notifications
const getNotificationFromDB = async (user: JwtPayload): Promise<INotification> => {
     const result = await Notification.find({ receiver: user.id }).populate(
          'receiver',
          'name email phoneNumber',
     );

     const unreadCount = await Notification.countDocuments({
          receiver: user.id,
          read: false,
     });

     const data: any = {
          result,
          unreadCount,
     };

     return data;
};

// read notifications only for user
const readNotificationToDB = async (user: JwtPayload): Promise<INotification | undefined> => {
     const result: any = await Notification.updateMany(
          { receiver: user.id, read: false },
          { $set: { read: true } },
     );
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
const adminNotificationFromDB = async () => {
     const result = await Notification.find({ type: 'ADMIN' });
     return result;
};

// read notifications only for admin
const adminReadNotificationToDB = async (): Promise<INotification | null> => {
     const result: any = await Notification.updateMany(
          { type: 'ADMIN', read: false },
          { $set: { read: true } },
          { new: true },
     );
     return result;
};
const adminSendNotificationFromDB = async (payload: any) => {
     const { title, message, receiver } = payload;

     // Validate required fields
     if (!title || !message) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Title and message are required');
     }

     // Handle specific receiver if provided
     if (receiver && typeof receiver === 'string') {
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
               throw new AppError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    'Error sending notification to receiver',
               );
          }
     }

     // Fetch users with role 'USER'
     const users = await User.find({ role: 'USER' });
     if (!users || users.length === 0) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No users found');
     }

     // Send notification to all users
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
          throw new AppError(
               StatusCodes.INTERNAL_SERVER_ERROR,
               'Error sending notifications to users',
          );
     }

     return;
};

export const NotificationService = {
     adminNotificationFromDB,
     getNotificationFromDB,
     readNotificationToDB,
     adminReadNotificationToDB,
     adminSendNotificationFromDB,
     readNotificationSingleToDB,
};

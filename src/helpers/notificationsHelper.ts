import { INotification } from '../app/modules/notification/notification.interface';
import { Notification } from '../app/modules/notification/notification.model';

export const sendNotifications = async (data: any): Promise<INotification> => {
     const result = await Notification.create(data);
     console.log('Notification data to send:', data); // Shows full data object

     //@ts-ignore
     const socketIo = global.io;
     if (socketIo) {
          if (data.receiver) {
               console.log(`Emitting notification to receiver: ${data.receiver}`, result);
               socketIo.emit(`notification::${data.receiver}`, result);
          } else {
               console.log('Emitting notification to all users:', result);
               socketIo.emit('notification::all', result);
          }
     }

     return result;
};

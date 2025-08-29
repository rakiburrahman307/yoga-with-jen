import { INotification } from '../app/modules/notification/notification.interface';
import { Notification } from '../app/modules/notification/notification.model';

export const sendNotifications = async (data: any): Promise<INotification> => {
     const result = await Notification.create(data);

   // @ts-expect-error - global.io is dynamically attached at runtime
     const socketIo = global.io as any;
     if (socketIo) {
          if (data.receiver) {
               socketIo.emit(`notification::${data.receiver}`, result);
          } else {
               socketIo.emit('notification::all', result);
          }
     }

     return result;
};

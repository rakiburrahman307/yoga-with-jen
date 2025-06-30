import { model, Schema } from 'mongoose';
import { IScheduledNotification, NotificationScheduleType, NotificationStatus, NotificationType, ReferenceModel } from './scheduledNotification.interface';

const notificationSchema = new Schema<IScheduledNotification>(
     {
          title: {
               type: String,
               required: true,
               trim: true,
          },
          message: {
               type: String,
               required: true,
          },
          type: {
               type: String,
               enum: Object.values(NotificationType),
               default: NotificationType.SYSTEM,
          },
          notificationType: {
               type: String,
               enum: Object.values(NotificationScheduleType),
               default: NotificationScheduleType.INSTANT,
          },
          referenceModel: {
               type: String,
               enum: Object.values(ReferenceModel),
               default: ReferenceModel.GENERAL,
          },
          referenceId: {
               type: Schema.Types.ObjectId,
               refPath: 'referenceModel',
          },
          receiver: {
               type: Schema.Types.ObjectId,
               ref: 'User',
               required: false,
          },
          sender: {
               type: Schema.Types.ObjectId,
               ref: 'User',
          },
          sendAt: {
               type: Date,
               default: Date.now,
          },
          status: {
               type: String,
               enum: Object.values(NotificationStatus),
               default: NotificationStatus.PENDING,
          },
          isIndividual: {
               type: Boolean,
               default: false,
          },
          sentAt: {
               type: Date,
          },
     },
     {
          timestamps: true,
     },
);

notificationSchema.index({ receiver: 1, read: 1 });
notificationSchema.index({ sendAt: 1, status: 1 });

export const ScheduledNotification = model<IScheduledNotification>('ScheduledNotification', notificationSchema);

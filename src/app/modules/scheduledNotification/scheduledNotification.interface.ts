import { Document, Types } from 'mongoose';

export enum NotificationType {
     ADMIN = 'ADMIN',
     USER = 'USER',
     SYSTEM = 'SYSTEM',
}

export enum NotificationScheduleType {
     INSTANT = 'instant',
     SCHEDULE = 'schedule',
}

export enum ReferenceModel {
     MESSAGE = 'MESSAGE',
     USER = 'USER',
     ORDER = 'ORDER',
     PAYMENT = 'PAYMENT',
     GENERAL = 'GENERAL',
}

export enum NotificationStatus {
     PENDING = 'PENDING',
     SENT = 'SEND',
     FAILED = 'FAILED',
     CANCELLED = 'CANCELLED',
}

export interface IScheduledNotification extends Document {
     title: string;
     message: string;
     type: NotificationType;
     notificationType: NotificationScheduleType;
     referenceModel: ReferenceModel;
     referenceId?: Types.ObjectId;
     receiver?: Types.ObjectId;
     sender?: Types.ObjectId;
     sendAt: Date;
     isIndividual: boolean;
     status: NotificationStatus;
     sentAt?: Date;
}

export interface CreateNotificationDto {
     title: string;
     message: string;
     type?: NotificationType;
     notificationType?: NotificationScheduleType;
     referenceModel?: ReferenceModel;
     referenceId?: string;
     receiver: string;
     sender?: string;
     sendAt?: Date;
}

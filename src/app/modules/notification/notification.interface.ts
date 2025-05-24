import { Types } from 'mongoose';

export interface INotification {
     text: string;
     receiver: Types.ObjectId;
     orderId: Types.ObjectId;
     reference?: string;
     referenceModel?: 'Payment' | 'Order' | 'Message';
     screen?: 'DASHBOARD' | 'PAYMENT_HISTORY' | 'PROFILE';
     read: boolean;
     type?: 'ADMIN' | 'SYSTEM' | 'PAYMENT' | 'MESSAGE' | 'ALERT';
     title?: string;
}

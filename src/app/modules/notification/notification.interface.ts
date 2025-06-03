import { Types } from 'mongoose';

export interface INotification {
     message: string;
     receiver: Types.ObjectId;
     postId: Types.ObjectId;
     reference?: string;
     sendAt: Date;
     status: 'PENDING' | 'SEND' | 'FAILED';
     referenceModel?: 'Payment' | 'Order' | 'Message';
     screen?: 'DASHBOARD' | 'PAYMENT_HISTORY' | 'PROFILE';
     read: boolean;
     type?: 'ADMIN' | 'SYSTEM' | 'PAYMENT' | 'MESSAGE' | 'ALERT';
     title?: string;
}

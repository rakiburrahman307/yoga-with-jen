import mongoose, { Schema } from 'mongoose';
import { IDeviceToken } from './fcmToken.interface';

const deviceTokenSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fcmToken: {
      type: String,
      required: true,
      trim: true,
    },
    deviceType: {
      type: String,
      enum: ['ios', 'android', 'web'],
      default: 'android',
    },
    deviceId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

deviceTokenSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
deviceTokenSchema.index({ fcmToken: 1 });

const DeviceToken = mongoose.model<IDeviceToken>('DeviceToken', deviceTokenSchema);

export default DeviceToken;
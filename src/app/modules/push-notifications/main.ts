import mongoose from "mongoose";
import admin from "../../../config/firebase";
import { User } from "../user/user.model";
import DeviceToken from "./fcmToken.model";
import { Notification } from "../notification/notification.model";

export const sendPushNotifications = async (booking: any, sender: any, type: string) => {
  try {
    const usersToNotify = await User.find({
      isVerified: true,
      _id: { $ne: sender._id },
      notificationStatus: true
    }).select('_id');

    const userIds = usersToNotify.map(user => user._id.toString());

    const fcmTokens = await DeviceToken.find({
      userId: { $in: userIds },
      fcmToken: { $exists: true, $ne: '' }
    }).select('fcmToken userId');

    const notificationMessage = type === 'create'
      ? `A new booking for service "${booking.serviceId}" created by "${sender.fullName}".`
      : `The status of your booking "${booking._id}" has been updated.`;

    const pushPayload: PushNotificationPayload = {
      notification: {
        title: `Booking Update: ${booking._id}`,
        body: notificationMessage,
      },
      data: {
        type: 'booking_update',
        title: `Booking ${booking._id}`,
        message: notificationMessage,
        bookingId: booking._id.toString(),
      },
    };

    for (const token of fcmTokens) {
      try {
        await admin.messaging().send({
          ...pushPayload,
          token: token.fcmToken,
        });
        console.log(`✅ Sent push to ${token.fcmToken}`);
      } catch (err: any) {
        console.error(`❌ Push failed to ${token.fcmToken}:`, err);
        if (err.code === 'messaging/registration-token-not-registered' || err.code === 'messaging/mismatched-credential') {
          await DeviceToken.deleteOne({ fcmToken: token.fcmToken });
          console.log(`🗑️ Removed invalid token: ${token.fcmToken}`);
        }
      }
    }

    // Save notifications to the database
    for (const userId of userIds) {
      try {
        await Notification.create({
          userId: new mongoose.Types.ObjectId(userId),
          message: notificationMessage,
          type: 'booking_update',
          title: `Booking ${booking._id}`,
          bookingId: booking._id,
          isRead: false,
          createdAt: new Date(),
        });
      } catch (err) {
        console.error('Error saving notification for user:', userId, err);
      }
    }

    console.log(`🔔 Notifications sent to ${userIds.length} users`);
  } catch (err) {
    console.error('Error in sendPushNotifications:', err);
  }
};
interface PushNotificationPayload {
  notification: {
    title: string;
    body: string;
  };
  data: {
    type: string;
    title: string;
    message: string;
    bookingId: string;
  };
}
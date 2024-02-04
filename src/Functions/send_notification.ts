import { ConfessionModel } from '../Models/confession';
import { getMessaging } from 'firebase-admin/messaging';

export const sendNotification = (
  firebaseToken: string,
  confession: ConfessionModel,
) => {
  const message = {
    data: {
      title: 'Hi, You have a confession',
      content:
        confession.confession.length >= 20
          ? confession.confession.substring(0, 20) + '...'
          : confession.confession.substring(
              0,
              confession.confession.length - 1,
            ) + '...',
    },
    token: firebaseToken,
  };

  getMessaging()
    .send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
};

import amqp from 'amqplib/callback_api';
import { IfRunningOnDocker } from '../enviornment_variables';

export class CreateQueue {
  isTesting: boolean = false;
  constructor(isTesting?: boolean) {
    if (isTesting) {
      this.isTesting = isTesting;
    }
  }
  createChannel = (callback: (chnl: amqp.Channel) => void) => {
    const rabbitMqConnectionString: string = this.isTesting
      ? 'amqp://localhost:5673'
      : IfRunningOnDocker == 'true'
        ? 'amqp://rabbit:5672'
        : 'amqp://rabbit';
    amqp.connect(
      rabbitMqConnectionString,
      async function (error: any, connection: amqp.Connection) {
        if (error) {
          console.log(error);
        }
        try {
          connection.createChannel((err, channel) => {
            if (err) {
              console.log(err);
            }
            callback(channel);
          });
        } catch (e: any) {
          console.log(e.toString());
        }
      },
    );
  };
}

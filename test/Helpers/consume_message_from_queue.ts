import { QueueNames } from '../../src/Constants/queues_redis';
import { TestServiceContainers } from './test_service_containers';
import { MessageHandler } from '../../src/Models/message_handler';

export const consumeMessageFromQueue = async (
  user_id: string,
): Promise<MessageHandler> => {
  let outputData: any;
  TestServiceContainers.getTestingRabbitClient().createChannel((chnl) => {
    chnl.assertQueue(QueueNames.OfflineQueue + user_id, {
      durable: true,
    });
    chnl.consume(QueueNames.OfflineQueue + user_id, (msg) => {
      if (msg == null) {
        outputData = null;
      } else {
        outputData = msg.content;
      }
    });
  });
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (outputData == null) {
    throw Error('Error');
  } else {
    return JSON.parse(outputData.toString());
  }
};

import { Logger } from 'pino';

export interface MessageQueue {
  push(topic: string, message: any): Promise<boolean>;
  subscribe(topic: string, callback: Function): Function;
}

export class MemoryMessageQueue implements MessageQueue {
  private queues: any;
  private subscribers: any;

  private logger: Logger;

  constructor(logger: Logger) {
    this.queues = {};
    this.subscribers = {};
    this.logger = logger;
  }

  public push(topic: string, message: any): Promise<boolean> {
    let queue: string[];
    if (!this.queues[topic]) {
      this.queues[topic] = queue = [];
    } else {
      queue = this.queues[topic];
    }
    queue.push(JSON.stringify(message));
    this.logger.debug({ topic }, 'Pushed message to topic.');
    setTimeout(() => {
      this.checkTopic(topic).then();
    }, 0);
    return Promise.resolve(true);
  }

  public subscribe(topic: string, callback: Function): Function {
    if (!(topic in this.subscribers)) {
      this.logger.debug({ topic }, 'Register subscriber to topic.');
      this.subscribers[topic] = callback;
    } else {
      throw new Error('Topic is already registerd.');
    }
    setTimeout(() => {
      this.checkTopic(topic).then();
    }, 0);
    return () => {
      delete this.subscribers[topic];
    };
  }

  private async checkTopic(topic: string) {
    this.logger.debug({ topic }, 'Check topic for messages.');
    const queue: string[] = this.queues[topic];
    const subscriber: Function = this.subscribers[topic];
    if (queue && subscriber && queue.length > 0) {
      this.logger.debug({ topic }, 'Got messages.');
      let currentMessage: string | undefined = undefined;
      try {
        currentMessage = queue.shift();
        if (currentMessage != null) {
          this.logger.debug({ topic }, 'Handle message.');
          if (!(await subscriber(JSON.parse(currentMessage)))) {
            this.push(topic, currentMessage);
            this.logger.debug(
              { topic },
              'Message not successfully handled. Message is pushed back to the queue.'
            );
          }
        }
      } catch (e) {
        console.error(e);
        if (currentMessage != null) {
          this.push(topic, currentMessage);
        }
        this.logger.error(
          { topic },
          'Error on handling topic for messages. Message is pushed back to the queue.'
        );
      } finally {
        setTimeout(() => {
          this.checkTopic(topic).then();
        }, 0);
      }
    }
  }
}

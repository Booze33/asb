import { Queue } from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { emailQueue, whatsappQueue } from './queue';
import { logger } from '../config/logger';

export class QueueMonitoring {
  private serverAdapter: ExpressAdapter;

  constructor() {
    this.serverAdapter = new ExpressAdapter();
    this.setupBullBoard();
  }

  private setupBullBoard(): void {
    this.serverAdapter.setBasePath('/bull-board');

    const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
      queues: [
        new BullAdapter(emailQueue),
        new BullAdapter(whatsappQueue)
      ],
      serverAdapter: this.serverAdapter,
    });

    logger.info('Bull Board monitoring setup complete');
    logger.info('Queue monitoring available at: /bull-board');
  }

  public getRouter() {
    return this.serverAdapter.getRouter();
  }

  public getQueues(): Queue[] {
    return [emailQueue, whatsappQueue];
  }
}

// Export singleton instance
export const queueMonitoring = new QueueMonitoring();
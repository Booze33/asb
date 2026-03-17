export class BullAdapter {
  constructor(queue: any) {
    // Mock constructor
  }

  getName(): string {
    return 'mock-queue';
  }

  getRedisInfo(): Promise<any> {
    return Promise.resolve({
      host: 'localhost',
      port: 6379
    });
  }
}
export const createBullBoard = jest.fn(() => ({
  addQueue: jest.fn(),
  removeQueue: jest.fn(),
  setQueues: jest.fn(),
  replaceQueues: jest.fn()
}));

export const BullAdapter = jest.fn().mockImplementation(() => ({
  getName: jest.fn(() => 'mock-queue'),
  getRedisInfo: jest.fn(() => Promise.resolve({ host: 'localhost', port: 6379 }))
}));

export const ExpressAdapter = jest.fn().mockImplementation(() => ({
  setBasePath: jest.fn(),
  getRouter: jest.fn(() => {
    const router = {
      get: jest.fn(),
      post: jest.fn(),
      use: jest.fn()
    };
    return router;
  })
}));

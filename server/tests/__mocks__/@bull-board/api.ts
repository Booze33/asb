// @ts-nocheck
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
    // Create a proper Express router that can be used as middleware
    const router = (req: any, res: any, next: any) => {
      next();
    };
    
    // Add all Express router methods
    const methods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'use', 'all', 'route', 'param', 'engine', 'set', 'enable', 'disable', 'enabled', 'disabled', 'render'];
    
    methods.forEach(method => {
      router[method] = jest.fn();
    });
    
    // Add some additional properties that Express router might have
    router.stack = [];
    router.params = {};
    router.caseSensitive = false;
    router.strict = false;
    
    return router;
  })
}));

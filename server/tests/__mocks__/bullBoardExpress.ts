export class ExpressAdapter {
  constructor() {
    // Mock constructor
  }

  setBasePath(path: string): void {
    // Mock method
  }

  getRouter(): any {
    return {
      get: jest.fn(),
      post: jest.fn(),
      use: jest.fn()
    };
  }
}
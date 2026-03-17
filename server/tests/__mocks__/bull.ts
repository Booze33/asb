import { EventEmitter } from 'events';

export class Queue extends EventEmitter {
  name: string;
  jobs: any[] = [];

  constructor(name: string) {
    super();
    this.name = name;
  }

  add(name: string, data: any, options?: any) {
    const job = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      data,
      options,
      process: jest.fn(),
      remove: jest.fn(),
      retry: jest.fn(),
      discard: jest.fn()
    };
    this.jobs.push(job);
    return Promise.resolve(job);
  }

  process(name: string, concurrency: number | Function, handler?: Function) {
    if (typeof concurrency === 'function') {
      handler = concurrency;
      concurrency = 1;
    }
    return Promise.resolve();
  }

  on(event: string, callback: (...args: any[]) => void) {
    return super.on(event, callback);
  }

  emit(event: string, ...args: any[]) {
    return super.emit(event, ...args);
  }

  getJob(id: string) {
    return Promise.resolve(this.jobs.find(job => job.id === id));
  }

  getJobs(types: string[], start?: number, end?: number) {
    return Promise.resolve(this.jobs.slice(start || 0, end || this.jobs.length));
  }

  empty() {
    this.jobs = [];
    return Promise.resolve();
  }

  pause() {
    return Promise.resolve();
  }

  resume() {
    return Promise.resolve();
  }

  close() {
    return Promise.resolve();
  }
}

export default Queue;
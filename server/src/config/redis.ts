import Redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://default:your_strong_redis_password_here@redis:6379',
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('ready', () => {
  console.log('Redis Client Ready');
});

redisClient.on('end', () => {
  console.log('Redis Client Disconnected');
});

export default redisClient;
import { promisify } from 'util';
import Redis from 'ioredis';

const client = Redis.createClient({
  host: 'localhost', // Redis host
  port: 6379,        // Redis port
});

const getAsync = promisify(client.get).bind(client);

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => {
  console.log('Redis error: ' + err);
});

export { client, getAsync };

import redis from "redis";
import { createClient } from "redis";
import dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

// 3. Buat URL koneksi
const redisUrl = `redis://${redisHost}:${redisPort}`;

const redisClient = createClient({
    url: redisUrl
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log(`Terhubung ke Redis di ${redisUrl}`);
    } catch (error) {
        console.error('Gagal koneksi Redis:', error);
    }
};

export default redisClient;
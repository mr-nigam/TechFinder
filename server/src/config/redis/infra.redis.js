import 'dotenv/config';
import createRedisConnection 
from './redisFactory.js';


const infraRedis = createRedisConnection({
    host: process.env.REDIS_INFRA_HOST,
    port: process.env.REDIS_INFRA_PORT,
    password: process.env.REDIS_INFRA_PASSWORD,
    db: process.env.REDIS_INFRA_DB,
    name: "Infra Redis",
});


export default infraRedis;
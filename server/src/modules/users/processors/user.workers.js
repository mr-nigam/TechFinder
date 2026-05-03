import { Worker } from 'bullmq';
import redisConnection from '#config/redis';


new Worker(
  "userQueue",
  async (job) => {
    console.log("📦 Processing Job:", job.name);
    console.log(job.data);

    if (job.name === "sendWelcomeEmail") {
      console.log(`Sending welcome email to ${job.data.email}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);
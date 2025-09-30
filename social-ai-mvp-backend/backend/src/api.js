require('dotenv').config();
const express = require('express');
const { Queue } = require('bullmq');
const Redis = require('ioredis');

const app = express();
app.use(express.json());

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const contentQueue = new Queue('content', { connection });

// Simple health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Enqueue a job to generate a post draft
app.post('/enqueue', async (req, res) => {
  const { brandId = 1, platform = 'instagram', slot = null } = req.body;
  const job = await contentQueue.add('generate', { brandId, platform, slot });
  res.json({ jobId: job.id, status: 'enqueued' });
});

// List jobs (simple)
app.get('/jobs', async (req, res) => {
  const jobs = await contentQueue.getJobs(['waiting','active','completed','failed'], 0, 20);
  res.json(jobs.map(j => ({ id: j.id, name: j.name, data: j.data, status: j.returnvalue || null })));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('API listening on port', port));

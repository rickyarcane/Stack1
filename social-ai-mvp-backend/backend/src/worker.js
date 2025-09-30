require('dotenv').config();
const { Worker } = require('bullmq');
const Redis = require('ioredis');
const axios = require('axios');

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Simple agent stubs
async function strategyAgent(jobData) {
  // Return a simple 1-week calendar slot suggestion
  return { theme: 'wellness-tip', objective: 'engagement' };
}

async function ideationAgent(theme) {
  return [
    { title: 'Midday Reset', hook: '5-minute breathing to reset your day', hashtags: ['#wellness','#reset'] }
  ];
}

async function copyAgent(idea) {
  return {
    captions: {
      short: idea.hook,
      medium: idea.hook + ' — try this simple breath.',
      long: idea.hook + ' — a slightly longer caption explaining why it works.'
    },
    alt_text: 'Person doing breathing exercise'
  };
}

async function creativeAgent(idea) {
  // In a real system, call Stable Diffusion / Canva etc.
  return { media_urls: ['https://via.placeholder.com/1080x1080.png?text=placeholder'] };
}

async function complianceAgent(caption, media) {
  // Run checks (toxicity, claims). Here we pass everything.
  return { verdict: 'pass', reasons: [] };
}

async function schedulerAgent(postRecord) {
  // In prod, call Buffer / Meta APIs. Here we just simulate scheduling.
  return { scheduled: true, platform_post_id: 'mock-post-123' };
}

async function generateJob(job) {
  console.log('Processing job', job.id, job.data);
  const { brandId, platform, slot } = job.data;

  const strategy = await strategyAgent(job.data);
  const ideas = await ideationAgent(strategy.theme);
  const idea = ideas[0];
  const copy = await copyAgent(idea);
  const creative = await creativeAgent(idea);
  const compliance = await complianceAgent(copy, creative);

  const post = {
    brand_id: brandId,
    platform,
    caption: copy.captions.medium,
    alt_text: copy.alt_text,
    media_urls: creative.media_urls,
    compliance
  };

  // NOTE: Replace DB write with real DB insert (pg)
  console.log('Draft post ready:', post);

  if (compliance.verdict === 'pass') {
    const scheduleRes = await schedulerAgent(post);
    console.log('Scheduled:', scheduleRes);
    return { ok: true, scheduled: scheduleRes };
  } else {
    return { ok: false, reason: 'compliance_failed' };
  }
}

const worker = new Worker('content', async job => {
  if (job.name === 'generate') {
    return await generateJob(job);
  }
}, { connection });

worker.on('completed', (job, returnvalue) => {
  console.log(`Job ${job.id} completed`, returnvalue);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed`, err);
});

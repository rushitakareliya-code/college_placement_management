/**
 * src/config/emailQueue.js
 *
 * Bull + Redis email queue with graceful Redis-offline handling.
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │  Redis online  → job enqueued → worker sends via Nodemailer  │
 * │  Redis offline → email sent directly (no crash, no drop)     │
 * └──────────────────────────────────────────────────────────────┘
 *
 * Bull uses THREE internal ioredis connections. Each has strict requirements:
 *
 *   type     │ maxRetriesPerRequest │ enableReadyCheck
 *   ─────────┼──────────────────────┼─────────────────
 *   client   │ null (required)      │ false
 *   subscriber│ null (required)     │ false  ← Bull validates this
 *   bclient  │ null (required)      │ false  ← Bull validates this
 *
 * Bull throws "MISSING_REDIS_OPTS" if enableReadyCheck is true OR
 * maxRetriesPerRequest is truthy on subscriber/bclient connections.
 * We supply our own clients via createClient to pre-attach error handlers
 * so no unhandled crash occurs when Redis is offline.
 */

const Bull       = require('bull');
const IORedis    = require('ioredis');
const nodemailer  = require('nodemailer');
const SmtpConfig = require('../models/SmtpConfig');

// ─── Redis availability flag ──────────────────────────────────────────────────
let redisAvailable = false;

// ─── Base connection parameters shared by all three client types ─────────────
// maxRetriesPerRequest: null → required by Bull for ALL client types
// enableReadyCheck:     false → required by Bull for subscriber/bclient
// enableOfflineQueue:   false → commands fail immediately when Redis is down
const REDIS_BASE = {
  host:                 process.env.REDIS_HOST     || '127.0.0.1',
  port:                 parseInt(process.env.REDIS_PORT || '6379', 10),
  password:             process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,   // ← falsy: satisfies Bull's check for all types
  enableReadyCheck:     false,  // ← falsy: satisfies Bull's check for sub/bclient
  enableOfflineQueue:   false,  // ← commands fail fast when Redis is offline
};

// ─── Attach shared event handlers and return the client ──────────────────────
function makeClient(label) {
  const client = new IORedis(REDIS_BASE);
  let warnedOffline = false; // suppress repeated ECONNREFUSED noise

  client.on('connect', () => {
    warnedOffline = false;
    if (!redisAvailable) {
      redisAvailable = true;
      console.log(`[Redis] ✅ Connected – email queue is active.`);
    }
  });

  client.on('error', (err) => {
    redisAvailable = false;
    if (err.code === 'ECONNREFUSED') {
      if (!warnedOffline) {
        warnedOffline = true;
        console.warn(`[Redis] ⚠ Cannot connect to Redis (${err.address}:${err.port}). Emails will be sent directly until Redis is available.`);
      }
    } else {
      console.warn(`[Redis:${label}] ⚠ ${err.message}`);
    }
  });

  client.on('end', () => { redisAvailable = false; });

  return client;
}

// ─── Bull queue ──────────────────────────────────────────────────────────────
const emailQueue = new Bull('emailQueue', {
  createClient: (type) => makeClient(type),   // called for client, subscriber, bclient
  defaultJobOptions: {
    attempts:         3,
    backoff:          { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail:     50,
  },
});

// Belt-and-suspenders queue-level guard
emailQueue.on('error', (err) => {
  // ECONNREFUSED is already logged by makeClient – skip duplicates here
  if (err.code !== 'ECONNREFUSED') {
    console.warn('[EmailQueue] Queue error:', err.message);
  }
  redisAvailable = false;
});

emailQueue.on('ready', () => {
  redisAvailable = true;
  console.log('[EmailQueue] ✅ Queue ready.');
});

// ─── Nodemailer transporter factory ──────────────────────────────────────────
async function createTransporter() {
  const config = await SmtpConfig.findOne({ isActive: true }).lean();
  if (!config) {
    throw new Error(
      'No active SMTP configuration. Go to Admin → Email Settings and save your Mailtrap credentials.'
    );
  }
  return {
    transporter: nodemailer.createTransport({
      host:   config.host,
      port:   config.port,
      secure: config.secure,
      auth:   { user: config.user, pass: config.password },
    }),
    config,
  };
}

// ─── Direct send (fallback when Redis is unavailable) ────────────────────────
async function sendEmailDirect(mailOptions) {
  const { transporter, config } = await createTransporter();
  const info = await transporter.sendMail({
    from: `"${config.fromName}" <${config.fromEmail}>`,
    ...mailOptions,
  });
  console.log(`[EmailDirect] ✅ Sent directly (no queue): ${info.messageId}`);
  return info.messageId;
}

// ─── Reusable dispatcher ─────────────────────────────────────────────────────
/**
 * Enqueue an email via Bull/Redis when Redis is available,
 * or send it immediately via Nodemailer when it is not.
 *
 * @param {object} mailOptions   { to, subject, html, text? }
 * @param {object} [jobOptions]  Bull job option overrides
 */
async function dispatchEmail(mailOptions, jobOptions = {}) {
  if (redisAvailable) {
    try {
      const job = await emailQueue.add({ mailOptions }, jobOptions);
      console.log(`[EmailQueue] Job #${job.id} queued → ${mailOptions.to}`);
      return job;
    } catch (queueErr) {
      console.warn('[EmailQueue] Queue add failed – falling back to direct send:', queueErr.message);
    }
  } else {
    console.log('[EmailQueue] Redis offline – sending email directly.');
  }

  return sendEmailDirect(mailOptions);
}

// ─── Worker: process queued jobs (when Redis IS available) ───────────────────
emailQueue.process(async (job) => {
  const { mailOptions } = job.data;
  const { transporter, config } = await createTransporter();

  const info = await transporter.sendMail({
    from: `"${config.fromName}" <${config.fromEmail}>`,
    ...mailOptions,
  });

  console.log(`[EmailQueue] ✅ Job #${job.id} sent: ${info.messageId}`);
  return info.messageId;
});

emailQueue.on('completed', (job) =>
  console.log(`[EmailQueue] ✅ Job #${job.id} completed.`)
);
emailQueue.on('failed', (job, err) =>
  console.error(`[EmailQueue] ❌ Job #${job.id} failed (attempt ${job.attemptsMade}): ${err.message}`)
);

module.exports = { emailQueue, dispatchEmail };

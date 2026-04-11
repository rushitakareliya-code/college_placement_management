const SmtpConfig = require('../models/SmtpConfig');
const nodemailer  = require('nodemailer');
const { renderTemplate } = require('../config/emailTemplates');

// ─── Mailtrap env defaults (used when no DB config is saved yet) ─────────────
const MAILTRAP_DEFAULTS = {
  host:      process.env.SMTP_HOST      || 'sandbox.smtp.mailtrap.io',
  port:      Number(process.env.SMTP_PORT || 2525),
  secure:    process.env.SMTP_SECURE === 'true',
  user:      process.env.SMTP_USER      || '',
  fromName:  process.env.SMTP_FROM_NAME || 'Placement Portal',
  fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@placementhub.dev',
};

// ─── GET active SMTP config ──────────────────────────────────────────────────
const getSmtpConfig = async (req, res) => {
  try {
    const config = await SmtpConfig.findOne({ isActive: true })
      .select('-password') // never expose password in GET
      .lean();

    if (config) {
      return res.json({ ...config, _fromDb: true });
    }

    // No saved config – return Mailtrap env defaults so the form is pre-filled
    // password is intentionally omitted; admin must type it
    res.json({ ...MAILTRAP_DEFAULTS, _fromDb: false });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// ─── SAVE / UPDATE SMTP config ──────────────────────────────────────────────
const saveSmtpConfig = async (req, res) => {
  try {
    const { host, port, secure, user, password, fromName, fromEmail } = req.body;

    if (!host || !port || !user || !fromEmail) {
      return res.status(400).json({ message: 'host, port, user, and fromEmail are required.' });
    }

    const existing = await SmtpConfig.findOne({});

    let updatePayload = {
      host,
      port: Number(port),
      secure: Boolean(secure),
      user,
      fromName: fromName || 'Placement Portal',
      fromEmail,
      isActive: true,
    };

    // Only update password if one was provided; keep existing otherwise
    if (password && password.trim()) {
      updatePayload.password = password;
    } else if (!existing) {
      // Brand-new config with no password → error
      return res.status(400).json({ message: 'Password is required for the initial configuration.' });
    }

    const updated = await SmtpConfig.findOneAndUpdate(
      {},
      updatePayload,
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'SMTP configuration saved successfully.', config: updated });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// ─── DELETE / RESET SMTP config ─────────────────────────────────────────────
const deleteSmtpConfig = async (req, res) => {
  try {
    await SmtpConfig.deleteMany({});
    res.json({ message: 'SMTP configuration removed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// ─── SEND TEST EMAIL ─────────────────────────────────────────────────────────
const sendTestEmail = async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ message: 'Recipient email (to) is required.' });

    const config = await SmtpConfig.findOne({ isActive: true }).lean();
    if (!config) return res.status(404).json({ message: 'No active SMTP configuration found. Please save the Mailtrap settings first.' });

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.password },
    });

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to,
      subject: '\u2705 Test Email \u2013 Placement Portal (Mailtrap)',
      html: renderTemplate('testEmail', {
        smtpHost:  config.host,
        smtpPort:  config.port,
        fromName:  config.fromName,
        fromEmail: config.fromEmail,
        recipient: to,
        sentAt:    new Date().toLocaleString(),
        year:      new Date().getFullYear(),
      }),
    });

    res.json({ message: `\u2705 Test email sent to ${to} \u2014 check your Mailtrap inbox!` });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to send test email.' });
  }
};

// ─── GET QUEUE STATUS (Bull metrics) ─────────────────────────────────────────
const getQueueStatus = async (req, res) => {
  try {
    const { emailQueue } = require('../config/emailQueue');
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
      emailQueue.getCompletedCount(),
      emailQueue.getFailedCount(),
      emailQueue.getDelayedCount(),
    ]);
    res.json({ waiting, active, completed, failed, delayed });
  } catch (err) {
    res.json({ waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, redisOffline: true, error: err.message });
  }
};

module.exports = { getSmtpConfig, saveSmtpConfig, deleteSmtpConfig, sendTestEmail, getQueueStatus };

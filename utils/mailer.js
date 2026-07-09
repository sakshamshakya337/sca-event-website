import nodemailer from 'nodemailer';

// Reuse a single transporter (singleton) with a pooled, secure (SSL/465)
// connection. Port 465 is typically faster and more reliable than the
// STARTTLS 587 path used by `service: 'gmail'`. Connection pooling avoids
// re-negotiating TLS on every send, which is the main source of latency.
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL — no STARTTLS upgrade handshake
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
    socketTimeout: 20000,
    connectionTimeout: 20000,
  });

  return transporter;
};

export const sendMail = async ({ to, subject, html }) => {
  try {
    const info = await getTransporter().sendMail({
      from: `"${process.env.MAIL_FROM_NAME || 'SCA Portal'}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Optional: verify connection once (used explicitly at startup, NOT at import).
export const verifyMailerConnection = () =>
  getTransporter().verify();

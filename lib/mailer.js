import nodemailer from 'nodemailer';

// Shared singleton transporter (secure SSL on port 465, pooled). Reusing the
// connection avoids the per-send TLS handshake that makes Gmail SMTP slow.
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
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

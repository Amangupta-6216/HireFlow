const nodemailer = require('nodemailer');

let transporter = null;

const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Graceful logger fallback for local dev
  return {
    sendMail: async (options) => {
      console.log(`\n================= [SIMULATED EMAIL NOTIFICATION] =================`);
      console.log(`To:      ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`From:    ${options.from || process.env.SMTP_FROM || 'HireFlow <no-reply@hireflow.dev>'}`);
      console.log(`------------------------------------------------------------------`);
      console.log(`Body snippet: ${options.html ? options.html.substring(0, 150).replace(/<[^>]*>/g, '') + '...' : options.text}`);
      console.log(`==================================================================\n`);
      return { messageId: `mock-${Date.now()}` };
    },
  };
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!transporter) {
      transporter = createTransporter();
    }
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"HireFlow Careers" <no-reply@hireflow.dev>',
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html,
    });
    return info;
  } catch (error) {
    console.error(`[Mailer Warning] Failed to send email to ${to}: ${error.message}`);
    return null;
  }
};

module.exports = {
  sendEmail,
};

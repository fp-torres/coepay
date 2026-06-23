import nodemailer from "nodemailer";

const buildTransporter = () => {
  const missingVariables = ["SMTP_HOST", "SMTP_FROM"].filter((key) => !process.env[key]);

  if (missingVariables.length > 0) {
    const error = new Error(`Configuração de e-mail incompleta: ${missingVariables.join(", ")}`);
    error.statusCode = 500;
    throw error;
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
  });
};

export const sendTransactionalEmail = async ({ to, subject, html, text }) => {
  const transporter = buildTransporter();

  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
    text,
  });
};

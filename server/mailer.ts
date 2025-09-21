import nodemailer from "nodemailer";

// Fonction pour envoyer un email
/**
 * Sends an email using the configured transporter
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @returns {Promise<any>} - Promise resolving to the email sending result
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<any> {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });

  return info;
}

export default sendEmail;
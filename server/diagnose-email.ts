import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

console.log("Email Configuration Diagnosis");
console.log("================================");

// Check environment variables
console.log("Environment Variables:");
console.log("- EMAIL_USER:", process.env.EMAIL_USER ? `${process.env.EMAIL_USER} (Set)` : "Not set");
console.log("- EMAIL_PASS:", process.env.EMAIL_PASS ? `${'*'.repeat(process.env.EMAIL_PASS.length)} (Set)` : "Not set");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log("\n❌ ERROR: EMAIL_USER and/or EMAIL_PASS not set in .env file");
  process.exit(1);
}

// Check if credentials are properly formatted
if (process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('@')) {
  console.log("\n⚠️  WARNING: EMAIL_USER doesn't look like an email address");
}

if (process.env.EMAIL_PASS && process.env.EMAIL_PASS.length !== 16) {
  console.log(`\n⚠️  WARNING: EMAIL_PASS is ${process.env.EMAIL_PASS.length} characters long, App Passwords are typically 16 characters`);
}

// Test transporter configuration
console.log("\nTesting transporter configuration...");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Transporter verification failed:", error.message);
    if (error.message.includes('Invalid login') || error.message.includes('EAUTH')) {
      console.log("\n🔧 TROUBLESHOOTING TIPS:");
      console.log("1. Make sure you're using an App Password, not your regular Gmail password");
      console.log("2. Ensure 2-Factor Authentication is enabled on your Google account");
      console.log("3. Generate a new App Password at: https://myaccount.google.com/apppasswords");
      console.log("4. Check that there are no extra spaces in your credentials");
      console.log("5. Try using a fresh App Password");
    }
  } else {
    console.log("✅ Transporter verification successful!");
    
    // Test sending email
    console.log("\nTesting email sending...");
    transporter.sendMail({
      from: `"StreamFlix" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "StreamFlix Email Configuration Test",
      html: "<h1>Success!</h1><p>Your email configuration is working correctly.</p>"
    }, (err, info) => {
      if (err) {
        console.log("❌ Email sending failed:", err.message);
      } else {
        console.log("✅ Email sent successfully!");
        console.log("Message ID:", info.messageId);
      }
    });
  }
});
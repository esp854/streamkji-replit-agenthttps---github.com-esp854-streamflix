import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // on force le chemin
import { sendEmail } from "./mailer";

async function testEmail() {
  try {
    console.log("Testing email configuration...");
    console.log("EMAIL_USER:", process.env.EMAIL_USER ? "Set" : "Not set");
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Set" : "Not set");
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("Please make sure EMAIL_USER and EMAIL_PASS are set in your .env file");
      return;
    }
    
    console.log(`Attempting to send test email from ${process.env.EMAIL_USER}...`);
    
    const result = await sendEmail(
      process.env.EMAIL_USER,
      "Test Email from StreamFlix",
      `
        <h1>Test Email</h1>
        <p>This is a test email from StreamFlix platform.</p>
        <p>If you received this email, the configuration is working correctly!</p>
        <hr>
        <p><strong>Debug Information:</strong></p>
        <ul>
          <li>EMAIL_USER: ${process.env.EMAIL_USER}</li>
          <li>EMAIL_PASS: ${process.env.EMAIL_PASS ? 'Set (length: ' + process.env.EMAIL_PASS.length + ')' : 'Not set'}</li>
        </ul>
      `
    );
    
    console.log("Email sent successfully!", result.messageId);
  } catch (error: any) {
    console.error("Error sending test email:", error.message);
    console.error("Error code:", error.code);
    
    // Specific error handling
    if (error.code === 'EAUTH') {
      console.error("\n🔐 AUTHENTICATION FAILED");
      console.error("Please check the following:");
      console.error("1. Ensure 2-Factor Authentication is enabled on your Google account");
      console.error("2. Use an App Password, not your regular Gmail password");
      console.error("3. Generate an App Password at: https://myaccount.google.com/apppasswords");
      console.error("4. Make sure EMAIL_USER and EMAIL_PASS in .env are correct");
    } else if (error.code === 'EENVELOPE') {
      console.error("\n📧 ENVELOPE ERROR");
      console.error("Check that the email address is valid");
    } else if (error.code === 'ECONNECTION') {
      console.error("\n🔌 CONNECTION ERROR");
      console.error("Check your network connection and firewall settings");
    } else {
      console.error("\n📋 FULL ERROR DETAILS:");
      console.error(JSON.stringify(error, null, 2));
    }
  }
}

testEmail();
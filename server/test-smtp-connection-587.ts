import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import nodemailer from "nodemailer";

console.log("🔍 Testing Gmail SMTP Connection with Port 587");
console.log("=============================================");

// Check if environment variables are set
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.log("❌ ERROR: Missing environment variables");
  console.log("   Please ensure EMAIL_USER and EMAIL_PASS are set in your .env file");
  process.exit(1);
}

console.log(`📧 Testing with EMAIL_USER: ${emailUser}`);
console.log(`🔑 Password length: ${emailPass.length} characters`);

// Create transporter with port 587 configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  tls: {
    rejectUnauthorized: false // Only for testing - remove in production
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP Connection Error:", error.message);
    
    if (error.message.includes("Invalid login")) {
      console.log("\n🔐 AUTHENTICATION FAILED");
      console.log("Possible causes:");
      console.log("1. Incorrect EMAIL_USER or EMAIL_PASS in .env file");
      console.log("2. 2-Factor Authentication not enabled on Google account");
      console.log("3. Not using an App Password (regular password won't work)");
      console.log("4. App Password has been revoked or expired");
      console.log("\n🔧 SOLUTIONS:");
      console.log("1. Verify your .env file credentials");
      console.log("2. Follow the GMAIL_SETUP_GUIDE.md instructions");
      console.log("3. Generate a new App Password at https://myaccount.google.com/apppasswords");
    } else if (error.message.includes("ECONNREFUSED")) {
      console.log("\n🔌 CONNECTION REFUSED");
      console.log("Possible causes:");
      console.log("1. Network connectivity issues");
      console.log("2. Firewall blocking SMTP connection");
      console.log("3. Gmail SMTP service temporarily unavailable");
    } else {
      console.log("\n📋 DETAILED ERROR INFORMATION:");
      console.log(JSON.stringify(error, null, 2));
    }
    
    process.exit(1);
  } else {
    console.log("✅ SMTP Server is ready to take our messages");
    console.log("✅ Gmail configuration with port 587 is working correctly!");
    
    console.log("\n📝 Next steps:");
    console.log("1. Run the full email test: npx tsx test-email.ts");
    console.log("2. Test user registration to verify welcome emails work");
  }
});
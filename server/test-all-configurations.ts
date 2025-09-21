import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import nodemailer from "nodemailer";

console.log("🔍 Testing Gmail SMTP with OAuth2-like configuration");
console.log("===================================================");

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

// Try different transporter configurations
console.log("\n1. Testing with service: 'gmail' (original method)");
try {
  const transporter1 = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
  
  transporter1.verify((error, success) => {
    if (error) {
      console.log("   ❌ Failed:", error.message);
    } else {
      console.log("   ✅ Success with service: 'gmail'");
    }
    
    // Test with host/port configuration
    console.log("\n2. Testing with host/port configuration");
    const transporter2 = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    
    transporter2.verify((error2, success2) => {
      if (error2) {
        console.log("   ❌ Failed:", error2.message);
      } else {
        console.log("   ✅ Success with host/port configuration");
      }
      
      // Test with port 587
      console.log("\n3. Testing with port 587 configuration");
      const transporter3 = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
      
      transporter3.verify((error3, success3) => {
        if (error3) {
          console.log("   ❌ Failed:", error3.message);
        } else {
          console.log("   ✅ Success with port 587 configuration");
        }
        
        console.log("\n📋 All tests completed. If all failed, the issue is likely with credentials or Gmail setup.");
      });
    });
  });
} catch (error) {
  console.error("Unexpected error:", error);
}
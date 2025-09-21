import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import nodemailer from "nodemailer";

console.log("🔍 Advanced Gmail SMTP Diagnostics");
console.log("================================");

// Check if environment variables are set
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log("1. Environment Variables Check:");
console.log(`   EMAIL_USER: ${emailUser ? "✅ Set" : "❌ Not set"}`);
console.log(`   EMAIL_PASS: ${emailPass ? "✅ Set" : "❌ Not set"}`);

if (!emailUser || !emailPass) {
  console.log("\n❌ ERROR: Missing environment variables");
  console.log("   Please ensure EMAIL_USER and EMAIL_PASS are set in your .env file");
  process.exit(1);
}

console.log(`\n2. Credentials Analysis:`);
console.log(`   EMAIL_USER: ${emailUser}`);
console.log(`   EMAIL_PASS length: ${emailPass.length} characters`);
console.log(`   EMAIL_PASS preview: ${emailPass.substring(0, 4)}****${emailPass.substring(emailPass.length - 4)}`);

// Check for common issues
console.log(`\n3. Common Issues Check:`);
console.log(`   - Is EMAIL_USER a valid email? ${emailUser.includes('@') && emailUser.includes('.') ? '✅' : '❌'}`);
console.log(`   - Is EMAIL_PASS exactly 16 characters? ${emailPass.length === 16 ? '✅' : '❌'}`);
console.log(`   - Does EMAIL_PASS contain spaces? ${emailPass.includes(' ') ? '❌' : '✅'}`);

// Try to detect if password might have been copied with extra characters
if (emailPass.length !== 16) {
  console.log(`   ⚠️  Warning: App Passwords should be exactly 16 characters`);
}

if (emailPass.includes(' ')) {
  console.log(`   ⚠️  Warning: App Passwords should not contain spaces`);
}

// Test different authentication methods
console.log(`\n4. Authentication Tests:`);

// Test 1: Basic transporter
console.log(`   Test 1: Basic transporter with service: 'gmail'`);
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
      console.log(`      ❌ Failed: ${error.message}`);
    } else {
      console.log(`      ✅ Success`);
    }
    
    // Test 2: Host/Port configuration
    console.log(`   Test 2: Host/Port configuration (port 465)`);
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
        console.log(`      ❌ Failed: ${error2.message}`);
      } else {
        console.log(`      ✅ Success`);
      }
      
      // Test 3: Port 587 configuration
      console.log(`   Test 3: Port 587 configuration`);
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
          console.log(`      ❌ Failed: ${error3.message}`);
        } else {
          console.log(`      ✅ Success`);
        }
        
        // Additional debugging
        console.log(`\n5. Additional Debugging Information:`);
        console.log(`   - Current working directory: ${process.cwd()}`);
        console.log(`   - Node.js version: ${process.version}`);
        
        // Check if there might be any invisible characters in the password
        const hasInvisibleChars = /[\u200B-\u200D\uFEFF]/.test(emailPass);
        console.log(`   - Password contains invisible characters: ${hasInvisibleChars ? '❌' : '✅'}`);
        
        // Check if password might have been copied with extra characters
        const trimmedPass = emailPass.trim();
        if (trimmedPass !== emailPass) {
          console.log(`   - Password has leading/trailing whitespace: ❌`);
          console.log(`   - Trimmed password length: ${trimmedPass.length}`);
        } else {
          console.log(`   - Password has no leading/trailing whitespace: ✅`);
        }
        
        console.log(`\n📋 Diagnostic Summary:`);
        console.log(`   If all tests failed, the issue is likely with:`);
        console.log(`   1. The Gmail account setup (2FA/App Password)`);
        console.log(`   2. The credentials in the .env file`);
        console.log(`   3. Network/firewall restrictions`);
        console.log(`   4. Google account security settings`);
        
        console.log(`\n🔧 Troubleshooting Steps:`);
        console.log(`   1. Double-check the .env file for typos`);
        console.log(`   2. Generate a new App Password at https://myaccount.google.com/apppasswords`);
        console.log(`   3. Ensure no extra spaces or characters were copied`);
        console.log(`   4. Try temporarily disabling antivirus/firewall`);
        console.log(`   5. Check Google account activity/security settings`);
      });
    });
  });
} catch (error) {
  console.error("Unexpected error:", error);
}
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import nodemailer from "nodemailer";

console.log("🔍 Final Diagnostic Test");
console.log("======================");

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log(`Testing with: ${emailUser}`);

// Let's try a different approach - test with debugging enabled
console.log("\n1. Testing with enhanced debugging");

// Set up debugging
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Only for testing

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  debug: true,
  logger: true,
});

console.log("Attempting to verify connection...");

transporter.verify((error: any, success) => {
  if (error) {
    console.log("❌ Verification failed:");
    console.log("   Error:", error.message);
    console.log("   Code:", error.code || 'N/A');
    console.log("   Command:", error.command || 'N/A');
    
    // Let's also try a direct connection test
    console.log("\n2. Testing direct connection");
    
    // Try to create a simple connection
    const net = require('net');
    const socket = net.createConnection(465, 'smtp.gmail.com', () => {
      console.log("✅ TCP connection successful");
      socket.end();
    });
    
    socket.on('error', (err: any) => {
      console.log("❌ TCP connection failed:", err.message);
    });
    
    socket.on('data', (data: any) => {
      console.log("Received data:", data.toString());
    });
    
  } else {
    console.log("✅ Verification successful!");
    console.log("Server is ready to send messages");
  }
  
  console.log("\n📋 Final Recommendations:");
  console.log("1. If TCP connection works but SMTP fails, it's definitely an authentication issue");
  console.log("2. If TCP connection fails, there might be network/firewall issues");
  console.log("3. Consider switching to a dedicated email service like SendGrid or Mailgun");
  console.log("4. These services are more reliable for application email sending");
  console.log("5. They often have free tiers that would work for development/testing");
});
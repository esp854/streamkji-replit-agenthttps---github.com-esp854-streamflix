import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

console.log("🔍 Alternative Authentication Methods Test");
console.log("=======================================");

// Check if environment variables are set
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log("Environment Variables:");
console.log(`EMAIL_USER: "${emailUser}"`);
console.log(`EMAIL_PASS: "${emailPass}"`);

console.log("\n📋 Alternative Solutions:");
console.log("Since App Password authentication is failing, here are alternative approaches:");

console.log("\n1. OAuth2 Authentication (Recommended by Google):");
console.log("   - Create a Google Cloud Project");
console.log("   - Enable Gmail API");
console.log("   - Create OAuth2 credentials");
console.log("   - Use OAuth2 instead of App Passwords");
console.log("   - This is more secure and reliable");

console.log("\n2. Use a different email provider:");
console.log("   - Consider using SendGrid, Mailgun, or AWS SES");
console.log("   - These services are designed for application email sending");
console.log("   - Often provide better deliverability and reliability");

console.log("\n3. Check Google Account Security Settings:");
console.log("   - Go to https://myaccount.google.com/security");
console.log("   - Check 'Recent security events' for any blocked attempts");
console.log("   - Ensure 'Less secure app access' is not disabled (though this setting is being deprecated)");
console.log("   - Check if your account has any restrictions");

console.log("\n4. Network/Environment Issues:");
console.log("   - Some networks block SMTP connections");
console.log("   - Corporate firewalls might block outgoing SMTP");
console.log("   - Try testing from a different network");

console.log("\n5. Generate a new App Password:");
console.log("   - Go to https://myaccount.google.com/apppasswords");
console.log("   - Revoke the current App Password");
console.log("   - Generate a new one");
console.log("   - Update your .env file with the new password");
console.log("   - Make sure to copy it correctly without any extra characters");

console.log("\n⚠️  Important Notes:");
console.log("   - Google is gradually deprecating App Passwords");
console.log("   - OAuth2 is the recommended authentication method");
console.log("   - If this continues to fail, consider switching to a dedicated email service");
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

console.log("🔍 Gmail Configuration Verification");
console.log("===================================");

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

console.log("\n2. Credentials Format Check:");
console.log(`   EMAIL_USER: ${emailUser}`);
console.log(`   EMAIL_PASS: ${emailPass ? `✅ Set (${emailPass.length} characters)` : "❌ Not set"}`);

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(emailUser)) {
  console.log("\n❌ ERROR: Invalid email format");
  console.log("   EMAIL_USER should be a valid email address");
  process.exit(1);
}

// Check password length (App Passwords are usually 16 characters)
if (emailPass && emailPass.length !== 16) {
  console.log("\n⚠️  WARNING: Password length is not 16 characters");
  console.log("   Gmail App Passwords are typically 16 characters long");
  console.log("   If this is not an App Password, please generate one at:");
  console.log("   https://myaccount.google.com/apppasswords");
}

console.log("\n3. Gmail Setup Instructions:");
console.log("   To fix authentication issues, follow these steps:");
console.log("   1. Go to https://myaccount.google.com/");
console.log("   2. Enable 2-Factor Authentication if not already enabled");
console.log("   3. Go to https://myaccount.google.com/apppasswords");
console.log("   4. Generate a new App Password for 'Mail'");
console.log("   5. Copy the 16-character password (no spaces)");
console.log("   6. Update your .env file with the App Password:");
console.log(`      EMAIL_USER=${emailUser}`);
console.log("      EMAIL_PASS=your_16_character_app_password");
console.log("   7. Save the .env file and run the test again");

console.log("\n✅ Verification complete. Please follow the instructions above to fix authentication issues.");
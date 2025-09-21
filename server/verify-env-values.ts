import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

console.log("🔍 .env File Content Verification");
console.log("================================");

// Check if environment variables are set
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log("Environment Variables:");
console.log(`EMAIL_USER: "${emailUser}"`);
console.log(`EMAIL_PASS: "${emailPass}"`);

console.log("\nDetailed Analysis:");
console.log(`EMAIL_USER length: ${emailUser ? emailUser.length : 0} characters`);
console.log(`EMAIL_PASS length: ${emailPass ? emailPass.length : 0} characters`);

// Check for invisible characters
if (emailUser) {
  const userHasInvisible = /[\u200B-\u200D\uFEFF]/.test(emailUser);
  console.log(`EMAIL_USER has invisible characters: ${userHasInvisible ? 'YES' : 'NO'}`);
}

if (emailPass) {
  const passHasInvisible = /[\u200B-\u200D\uFEFF]/.test(emailPass);
  console.log(`EMAIL_PASS has invisible characters: ${passHasInvisible ? 'YES' : 'NO'}`);
  
  // Show character codes for password (useful for detecting hidden characters)
  console.log("EMAIL_PASS character codes:");
  for (let i = 0; i < Math.min(emailPass.length, 20); i++) {
    console.log(`  Position ${i}: '${emailPass[i]}' (code: ${emailPass.charCodeAt(i)})`);
  }
  if (emailPass.length > 20) {
    console.log(`  ... and ${emailPass.length - 20} more characters`);
  }
}

// Check for common issues
console.log("\nCommon Issues Check:");
if (emailUser && emailUser.includes(" ")) {
  console.log("❌ EMAIL_USER contains spaces");
} else {
  console.log("✅ EMAIL_USER has no spaces");
}

if (emailPass && emailPass.includes(" ")) {
  console.log("❌ EMAIL_PASS contains spaces");
} else {
  console.log("✅ EMAIL_PASS has no spaces");
}

// Verify email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (emailUser && emailRegex.test(emailUser)) {
  console.log("✅ EMAIL_USER has valid email format");
} else {
  console.log("❌ EMAIL_USER does not have valid email format");
}

console.log("\n📋 Recommendations:");
console.log("1. If you see any unexpected characters above, retype the values in your .env file");
console.log("2. Make sure there are no extra quotes or special characters");
console.log("3. Try generating a new App Password and updating the .env file");
console.log("4. Ensure the App Password was copied correctly without any extra characters");
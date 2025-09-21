import bcrypt from "bcryptjs";
import { storage } from "./storage";

async function createAdminUser() {
  try {
    const adminEmail = "admin@streamkji.com";
    const adminUsername = "admin";
    const adminPassword = "admin123"; // Change this to a secure password

    // Check if admin already exists
    const existingAdmin = await storage.getUserByEmail(adminEmail);
    if (existingAdmin) {
      console.log("Admin user already exists with email:", adminEmail);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const adminUser = await storage.createUser({
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin user created successfully!");
    console.log("Email:", adminEmail);
    console.log("Username:", adminUsername);
    console.log("Password:", adminPassword);
    console.log("Please change the default password after first login.");
    console.log("User ID:", adminUser.id);

  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

// Run the script
createAdminUser().then(() => {
  console.log("Script completed.");
  process.exit(0);
}).catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
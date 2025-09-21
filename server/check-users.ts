import { storage } from "./storage";

async function checkUsers() {
  try {
    const users = await storage.getAllUsers();
    console.log("Users in database:");
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

checkUsers().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
import { storage } from "./storage";

async function checkAdminAccess() {
  try {
    console.log("Checking admin access...");
    
    // Get all users
    const users = await storage.getAllUsers();
    console.log("All users:");
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - Role: ${user.role}`);
    });
    
    // Check if there's an admin user
    const adminUsers = users.filter(user => user.role === 'admin');
    console.log("\nAdmin users:");
    if (adminUsers.length > 0) {
      adminUsers.forEach(user => {
        console.log(`- ${user.username} (${user.email})`);
      });
    } else {
      console.log("No admin users found!");
    }
    
    // Check content
    const content = await storage.getContent();
    console.log(`\nContent items: ${content.length}`);
    
  } catch (error) {
    console.error("Error checking admin access:", error);
  }
}

// Run the check
checkAdminAccess();
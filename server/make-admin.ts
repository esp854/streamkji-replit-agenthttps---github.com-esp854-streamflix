import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function makeUserAdmin(email: string) {
  try {
    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      console.log(`User with email ${email} not found`);
      return;
    }

    // Update user role to admin
    const [updatedUser] = await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.email, email))
      .returning();

    console.log(`User ${updatedUser.username} (${updatedUser.email}) has been granted admin privileges`);
  } catch (error) {
    console.error("Error updating user role:", error);
  }
}

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.log("Usage: npx tsx make-admin.ts <user-email>");
  process.exit(1);
}

makeUserAdmin(email).then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
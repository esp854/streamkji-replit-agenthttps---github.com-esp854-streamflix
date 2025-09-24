import bcrypt from "bcryptjs";
import { storage } from "./storage";

async function createAdminUser() {
  try {
    const adminEmail = "admin@streamkji.com";
    const adminUsername = "admin";
    const adminPassword = "admin123"; // Change this to a secure password

    console.log("🔍 Vérification de l'utilisateur admin existant...");

    // Check if admin already exists
    const existingAdmin = await storage.getUserByEmail(adminEmail);

    if (existingAdmin) {
      console.log("✅ Admin existant trouvé:", existingAdmin.username);

      // Vérifier si le rôle est correct
      if (existingAdmin.role !== "admin") {
        console.log("🔧 Mise à jour du rôle admin...");
        await storage.updateUser(existingAdmin.id, { role: "admin" });
        console.log("✅ Rôle admin mis à jour");
      }

      // Réinitialiser le mot de passe si nécessaire
      const isValidPassword = await bcrypt.compare(adminPassword, existingAdmin.password);
      if (!isValidPassword) {
        console.log("🔑 Réinitialisation du mot de passe admin...");
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await storage.updateUser(existingAdmin.id, { password: hashedPassword });
        console.log("✅ Mot de passe admin réinitialisé");
      }

      console.log("🎯 Admin prêt à être utilisé !");
    } else {
      console.log("👤 Création d'un nouvel utilisateur admin...");

      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Create admin user
      const adminUser = await storage.createUser({
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });

      console.log("✅ Admin créé avec succès !");
      console.log("🆔 ID:", adminUser.id);
    }

    console.log("\n📋 Informations de connexion admin :");
    console.log("📧 Email:", adminEmail);
    console.log("👤 Nom d'utilisateur:", adminUsername);
    console.log("🔒 Mot de passe:", adminPassword);
    console.log("⚠️  IMPORTANT: Changez ce mot de passe après la première connexion !");

  } catch (error) {
    console.error("❌ Erreur lors de la création/mise à jour de l'admin:", error);
    throw error; // Re-throw pour que le script échoue
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
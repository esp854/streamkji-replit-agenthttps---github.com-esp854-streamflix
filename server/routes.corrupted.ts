import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { plans } from "./plans";
import { paymentService, type CustomerInfo } from "./payment-service";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  insertFavoriteSchema, 
  insertWatchHistorySchema, 
  insertUserPreferencesSchema, 
  insertContactMessageSchema, 
  insertUserSchema,
  insertSubscriptionSchema,
  insertPaymentSchema,
  insertBannerSchema,
  insertCollectionSchema,
  insertContentSchema,
  insertNotificationSchema,
  insertUserSessionSchema,
  insertViewTrackingSchema,
  users,
  payments,
  notifications,
  userSessions,
  viewTracking,
  favorites,
  watchHistory
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authLimiter, bruteForceProtection, resetLoginAttempts, authenticateToken, csrfProtection, generateCSRFToken } from "./security";
import { sendEmail } from "./mailer";
import { securityLogger } from "./security-logger";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here-change-in-production";

// Admin middleware
async function requireAdmin(req: any, res: any, next: any) {
  try {
    if (!req.user) {
      securityLogger.logUnauthorizedAccess(req.ip || 'unknown', req.path);
      return res.status(401).json({ error: "Non authentifié" });
    }
    
    // Check if user is admin by fetching from database
    const user = await storage.getUserById(req.user.userId);
    if (!user || user.role !== "admin") {
      securityLogger.logUnauthorizedAccess(req.ip || 'unknown', req.path, req.user.userId);
      return res.status(403).json({ error: "Accès administrateur requis" });
    }
    
    securityLogger.logAdminAccess(req.user.userId, req.ip || 'unknown', `Accessed ${req.path}`);
    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// Login/Register schemas
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères")
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const server = createServer(app);
  
  // Apply authentication middleware to all routes
  app.use(authenticateToken);
  
  // Apply CSRF protection to all routes
  app.use(csrfProtection);
  
  // Email sending endpoint
  app.post("/api/send-email", async (req: any, res: any) => {
    // Only allow admin users to send emails
    if (!req.user) {
      securityLogger.logUnauthorizedAccess(req.ip || 'unknown', req.path);
      return res.status(401).json({ error: "Non authentifié" });
    }
    
    try {
      const user = await storage.getUserById(req.user.userId);
      if (!user || user.role !== "admin") {
        securityLogger.logUnauthorizedAccess(req.ip || 'unknown', req.path, req.user.userId);
        return res.status(403).json({ error: "Accès administrateur requis" });
      }
      
      const { to, subject, message } = req.body;
      
      if (!to || !subject || !message) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
      }
      
      const html = `<p>${message}</p><p><br>Cordialement,<br>L'équipe StreamFlix</p>`;
      
      await sendEmail(to, subject, html);
      securityLogger.logEmailSent(to, subject, req.user.userId);
      
      res.json({ success: true, message: "Email envoyé avec succès" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
    }
  });
  
  // Email announcement endpoint - send to all users
  app.post("/api/send-announcement", async (req: any, res: any) => {
    // Only allow admin users to send announcements
    if (!req.user) {
      securityLogger.logUnauthorizedAccess(req.ip || 'unknown', req.path);
      return res.status(401).json({ error: "Non authentifié" });
    }
    
    try {
      const user = await storage.getUserById(req.user.userId);
      if (!user || user.role !== "admin") {
        securityLogger.logUnauthorizedAccess(req.ip || 'unknown', req.path, req.user.userId);
        return res.status(403).json({ error: "Accès administrateur requis" });
      }
      
      const { subject, message } = req.body;
      
      if (!subject || !message) {
        return res.status(400).json({ error: "Le sujet et le message sont requis" });
      }
      
      // Get all users
      const users = await storage.getAllUsers();
      
      // Filter out users without email addresses
      const validUsers = users.filter(u => u.email && u.email.trim() !== '');
      
      // Send email to each user
      const emailPromises = validUsers.map(async (user) => {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${subject}</h2>
            <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p>Cordialement,<br><strong>L'équipe StreamFlix</strong></p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              Vous recevez cet email parce que vous êtes inscrit sur StreamFlix. 
              Si vous ne souhaitez plus recevoir ces annonces, veuillez nous contacter.
            </p>
          </div>
        `;
        
        try {
          await sendEmail(user.email, subject, html);
          securityLogger.logEmailSent(user.email, subject, req.user?.userId);
          return { email: user.email, status: 'success' };
        } catch (error: unknown) {
          console.error(`Failed to send email to ${user.email}:`, error);
          return { email: user.email, status: 'error', error: (error as Error).message || 'Unknown error' };
        }
      });
      
      // Wait for all emails to be sent
      const results = await Promise.all(emailPromises);
      
      // Count successes and failures
      const successCount = results.filter(r => r.status === 'success').length;
      const failureCount = results.length - successCount;
      
      res.json({ 
        success: true, 
        message: `Annonce envoyée à ${successCount} utilisateurs sur ${results.length} au total.`,
        details: {
          total: results.length,
          success: successCount,
          failed: failureCount
        }
      });
    } catch (error) {
      console.error("Error sending announcement:", error);
      res.status(500).json({ error: "Erreur lors de l'envoi de l'annonce" });
    }
  });
  
  // Authentication routes with additional security
  app.post("/api/auth/register", authLimiter, async (req: any, res: any) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Un utilisateur avec cet email existe déjà" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        username: userData.username,
        email: userData.email,
        password: hashedPassword
      });
      
      // Send welcome email
      try {
        const welcomeHtml = `
          <h1>Bienvenue sur StreamFlix !</h1>
          <p>Bonjour ${user.username},</p>
          <p>Merci pour votre inscription sur StreamFlix. Profitez de nos films et séries !</p>
          <p>Cordialement,<br>L'équipe StreamFlix</p>
        `;
        await sendEmail(user.email, "Bienvenue sur StreamFlix !", welcomeHtml);
        securityLogger.logEmailSent(user.email, "Bienvenue sur StreamFlix !", user.id);
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Don't fail registration if email fails
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Set HttpOnly cookie for token
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Return user info without password
      const { password, ...userWithoutPassword } = user;
      securityLogger.logSuccessfulLogin(user.id, req.ip || 'unknown', req.headers['user-agent']);
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Error registering user:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Données invalides", details: error.errors });
      } else {
        res.status(500).json({ error: "Erreur lors de l'inscription" });
      }
    }
  });

  app.post("/api/auth/login", authLimiter, bruteForceProtection, async (req: any, res: any) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        securityLogger.logFailedLogin(req.ip || 'unknown', email, req.headers['user-agent']);
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        securityLogger.logFailedLogin(req.ip || 'unknown', email, req.headers['user-agent']);
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }
      
      // Reset brute force protection on successful login
      resetLoginAttempts(req, res, () => {});
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Set HttpOnly cookie for token
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Return user info without password
      const { password: _, ...userWithoutPassword } = user;
      securityLogger.logSuccessfulLogin(user.id, req.ip || 'unknown', req.headers['user-agent']);
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Error logging in user:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Données invalides", details: error.errors });
      } else {
        res.status(500).json({ error: "Erreur lors de la connexion" });
      }
    }
  });

  app.post("/api/auth/logout", async (req: any, res: any) => {
    // Clear the auth cookie
    res.clearCookie('auth_token');
    res.json({ message: "Déconnexion réussie" });
  });

  app.get("/api/auth/me", async (req: any, res: any) => {
    console.log('GET /api/auth/me - req.user:', req.user);
    
    if (!req.user) {
      // Return null user for unauthenticated requests instead of 401
      return res.json({ user: null });
    }
    
    try {
      const user = await storage.getUserById(req.user.userId);
      console.log('GET /api/auth/me - user from DB:', user);
      
      if (!user) {
        return res.json({ user: null });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
    }
  });
  
  // Get user favorites
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  // Add to favorites
  app.post("/api/favorites", async (req, res) => {
    try {
      const favoriteData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.addFavorite(favoriteData);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid favorite data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to add favorite" });
      }
    }
  });

  // Remove from favorites
  app.delete("/api/favorites/:userId/:movieId", async (req, res) => {
    try {
      const { userId, movieId } = req.params;
      await storage.removeFavorite(userId, parseInt(movieId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // Check if movie is favorite
  app.get("/api/favorites/:userId/:movieId", async (req, res) => {
    try {
      const { userId, movieId } = req.params;
      const isFavorite = await storage.isFavorite(userId, parseInt(movieId));
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite:", error);
      res.status(500).json({ error: "Failed to check favorite" });
    }
  });

  // Get watch history
  app.get("/api/watch-history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const history = await storage.getWatchHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching watch history:", error);
      res.status(500).json({ error: "Failed to fetch watch history" });
    }
  });

  // Add to watch history
  app.post("/api/watch-history", async (req, res) => {
    try {
      const historyData = insertWatchHistorySchema.parse(req.body);
      const history = await storage.addToWatchHistory(historyData);
      res.json(history);
    } catch (error) {
      console.error("Error adding to watch history:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid watch history data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to add to watch history" });
      }
    }
  });

  // Get user preferences
  app.get("/api/user-preferences/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ error: "Failed to fetch user preferences" });
    }
  });

  // Update user preferences
  app.put("/api/user-preferences/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const preferencesData = insertUserPreferencesSchema.parse(req.body);
      const preferences = await storage.updateUserPreferences(userId, preferencesData);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid preferences data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update user preferences" });
      }
    }
  });

  // Contact message
  app.post("/api/contact-messages", async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating contact message:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid message data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create contact message" });
      }
    }
  });

  // Get contact messages (admin only)
  app.get("/api/contact-messages", requireAdmin, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ error: "Failed to fetch contact messages" });
    }
  });

  // Delete contact message (admin only)
  app.delete("/api/contact-messages/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteContactMessage(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ error: "Failed to delete contact message" });
    }
  });

  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Ban user (admin only)
  app.post("/api/admin/users/:userId/ban", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Validate user ID
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      // Check if user exists
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Prevent banning admin users
      if (user.role === "admin") {
        return res.status(403).json({ error: "Cannot ban admin users" });
      }
      
      // Ban the user
      const bannedUser = await storage.banUser(userId);
      
      // Log the action
      securityLogger.logEvent({
        timestamp: new Date(),
        eventType: 'ADMIN_ACCESS',
        userId: req.user?.userId,
        ipAddress: req.ip || 'unknown',
        details: `User ${user.username} (${user.id}) banned by admin ${req.user?.userId}`,
        severity: 'MEDIUM'
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = bannedUser;
      res.json({ 
        message: "User banned successfully", 
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error("Error banning user:", error);
      res.status(500).json({ error: "Failed to ban user" });
    }
  });

  // Unban user (admin only)
  app.post("/api/admin/users/:userId/unban", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Validate user ID
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      // Check if user exists
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Unban the user
      const unbannedUser = await storage.unbanUser(userId);
      
      // Log the action
      securityLogger.logEvent({
        timestamp: new Date(),
        eventType: 'ADMIN_ACCESS',
        userId: req.user?.userId,
        ipAddress: req.ip || 'unknown',
        details: `User ${user.username} (${user.id}) unbanned by admin ${req.user?.userId}`,
        severity: 'MEDIUM'
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = unbannedUser;
      res.json({ 
        message: "User unbanned successfully", 
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error("Error unbanning user:", error);
      res.status(500).json({ error: "Failed to unban user" });
    }
  });

  // Get all favorites (admin only)
  app.get("/api/admin/favorites", requireAdmin, async (req, res) => {
    try {
      const favorites = await storage.getAllFavorites();
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching all favorites:", error);
      res.status(500).json({ error: "Failed to fetch all favorites" });
    }
  });

  // Get all watch history (admin only)
  app.get("/api/admin/watch-history", requireAdmin, async (req, res) => {
    try {
      const history = await storage.getWatchHistory('all');
      res.json(history);
    } catch (error) {
      console.error("Error fetching all watch history:", error);
      res.status(500).json({ error: "Failed to fetch all watch history" });
    }
  });

  // Get all user preferences (admin only)
  app.get("/api/admin/user-preferences", requireAdmin, async (req, res) => {
    try {
      // Since there's no getAllUserPreferences method, we'll need to implement this differently
      // For now, return empty array
      res.json([]);
    } catch (error) {
      console.error("Error fetching all user preferences:", error);
      res.status(500).json({ error: "Failed to fetch all user preferences" });
    }
  });

  // Get all payment information (admin only)
  app.get("/api/admin/payments", requireAdmin, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching all payments:", error);
      res.status(500).json({ error: "Failed to fetch all payments" });
    }
  });

  // Get all subscriptions (admin only)
  app.get("/api/admin/subscriptions", requireAdmin, async (req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching all subscriptions:", error);
      res.status(500).json({ error: "Failed to fetch all subscriptions" });
    }
  });

  // Get all banners (admin only)
  app.get("/api/admin/banners", requireAdmin, async (req, res) => {
    try {
      const banners = await storage.getBanners();
      res.json(banners);
    } catch (error) {
      console.error("Error fetching all banners:", error);
      res.status(500).json({ error: "Failed to fetch all banners" });
    }
  });

  // Get all collections (admin only)
  app.get("/api/admin/collections", requireAdmin, async (req, res) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      console.error("Error fetching all collections:", error);
      res.status(500).json({ error: "Failed to fetch all collections" });
    }
  });

  // Get all content (admin only)
  app.get("/api/admin/content", requireAdmin, async (req, res) => {
    try {
      const content = await storage.getAllContent();
      res.json(content);
    } catch (error) {
      console.error("Error fetching all content:", error);
      res.status(500).json({ error: "Failed to fetch all content" });
    }
  });

  // Get all notifications (admin only)
  app.get("/api/admin/notifications", requireAdmin, async (req, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching all notifications:", error);
      res.status(500).json({ error: "Failed to fetch all notifications" });
    }
  });

  // Get all user sessions (admin only)
  app.get("/api/admin/user-sessions", requireAdmin, async (req, res) => {
    try {
      // Since there's no getAllUserSessions method, we'll need to implement this differently
      // For now, return empty array
      res.json([]);
    } catch (error) {
      console.error("Error fetching all user sessions:", error);
      res.status(500).json({ error: "Failed to fetch all user sessions" });
    }
  });

  // Get all view tracking (admin only)
  app.get("/api/admin/view-tracking", requireAdmin, async (req, res) => {
    try {
      // Since there's no getAllViewTracking method, we'll need to implement this differently
      // For now, return empty array
      res.json([]);
    } catch (error) {
      console.error("Error fetching all view tracking:", error);
      res.status(500).json({ error: "Failed to fetch all view tracking" });
    }
  });

  // Create favorite (admin only)
  app.post("/api/admin/favorites", requireAdmin, async (req, res) => {
    try {
      const favoriteData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.addFavorite(favoriteData);
      res.json(favorite);
    } catch (error) {
      console.error("Error creating favorite:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid favorite data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create favorite" });
      }
    }
  });

  // Create watch history (admin only)
  app.post("/api/admin/watch-history", requireAdmin, async (req, res) => {
    try {
      const historyData = insertWatchHistorySchema.parse(req.body);
      const history = await storage.addToWatchHistory(historyData);
      res.json(history);
    } catch (error) {
      console.error("Error creating watch history:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid watch history data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create watch history" });
      }
    }
  });

  // Create user preference (admin only)
  app.post("/api/admin/user-preferences", requireAdmin, async (req, res) => {
    try {
      const preferencesData = insertUserPreferencesSchema.parse(req.body);
      // Using updateUserPreferences instead as createUserPreferences doesn't exist
      const preferences = await storage.updateUserPreferences(preferencesData.userId, preferencesData);
      res.json(preferences);
    } catch (error) {
      console.error("Error creating user preference:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid preferences data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create user preference" });
      }
    }
  });

  // Create user (admin only)
  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid user data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create user" });
      }
    }
  });

  // Create subscription (admin only)
  app.post("/api/admin/subscriptions", requireAdmin, async (req, res) => {
    try {
      const subscriptionData = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription(subscriptionData);
      res.json(subscription);
    } catch (error) {
      console.error("Error creating subscription:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid subscription data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create subscription" });
      }
    }
  });

  // Create payment (admin only)
  app.post("/api/admin/payments", requireAdmin, async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid payment data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create payment" });
      }
    }
  });

  // Create banner (admin only)
  app.post("/api/admin/banners", requireAdmin, async (req, res) => {
    try {
      const bannerData = insertBannerSchema.parse(req.body);
      const banner = await storage.createBanner(bannerData);
      res.json(banner);
    } catch (error) {
      console.error("Error creating banner:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid banner data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create banner" });
      }
    }
  });

  // Create collection (admin only)
  app.post("/api/admin/collections", requireAdmin, async (req, res) => {
    try {
      const collectionData = insertCollectionSchema.parse(req.body);
      const collection = await storage.createCollection(collectionData);
      res.json(collection);
    } catch (error) {
      console.error("Error creating collection:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid collection data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create collection" });
      }
    }
  });

  // Create content (admin only)
  app.post("/api/admin/content", requireAdmin, async (req, res) => {
    try {
      const contentData = insertContentSchema.parse(req.body);
      const content = await storage.createContent(contentData);
      res.json(content);
    } catch (error) {
      console.error("Error creating content:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid content data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create content" });
      }
    }
  });

  // Create notification (admin only)
  app.post("/api/admin/notifications", requireAdmin, async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid notification data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create notification" });
      }
    }
  });

  // Create user session (admin only)
  app.post("/api/admin/user-sessions", requireAdmin, async (req, res) => {
    try {
      const sessionData = insertUserSessionSchema.parse(req.body);
      const session = await storage.createUserSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating user session:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid session data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create user session" });
      }
    }
  });

  // Create view tracking (admin only)
  app.post("/api/admin/view-tracking", requireAdmin, async (req, res) => {
    try {
      const trackingData = insertViewTrackingSchema.parse(req.body);
      const tracking = await storage.createViewTracking(trackingData);
      res.json(tracking);
    } catch (error) {
      console.error("Error creating view tracking:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid tracking data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create view tracking" });
      }
    }
  });

  // Update favorite (admin only)
  app.put("/api/admin/favorites/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const favoriteData = insertFavoriteSchema.parse(req.body);
      // updateFavorite doesn't exist, using addFavorite instead
      const favorite = await storage.addFavorite(favoriteData);
      res.json(favorite);
    } catch (error) {
      console.error("Error updating favorite:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid favorite data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update favorite" });
      }
    }
  });

  // Update watch history (admin only)
  app.put("/api/admin/watch-history/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const historyData = insertWatchHistorySchema.parse(req.body);
      // updateWatchHistory doesn't exist, using addToWatchHistory instead
      const history = await storage.addToWatchHistory(historyData);
      res.json(history);
    } catch (error) {
      console.error("Error updating watch history:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid watch history data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update watch history" });
      }
    }
  });

  // Update user preference (admin only)
  app.put("/api/admin/user-preferences/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const preferencesData = insertUserPreferencesSchema.parse(req.body);
      const preferences = await storage.updateUserPreferences(id, preferencesData);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating user preference:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid preferences data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update user preference" });
      }
    }
  });

  // Update user (admin only)
  app.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.updateUser(id, userData);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid user data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update user" });
      }
    }
  });

  // Update subscription (admin only)
  app.put("/api/admin/subscriptions/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const subscriptionData = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.updateSubscription(id, subscriptionData);
      res.json(subscription);
    } catch (error) {
      console.error("Error updating subscription:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid subscription data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update subscription" });
      }
    }
  });

  // Update payment (admin only)
  app.put("/api/admin/payments/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const paymentData = insertPaymentSchema.parse(req.body);
      // updatePayment doesn't exist, using a custom update approach
      const [payment] = await db.update(payments).set(paymentData as any).where(eq(payments.id, id)).returning();
      res.json(payment);
    } catch (error) {
      console.error("Error updating payment:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid payment data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update payment" });
      }
    }
  });

  // Update banner (admin only)
  app.put("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const bannerData = insertBannerSchema.parse(req.body);
      const banner = await storage.updateBanner(id, bannerData);
      res.json(banner);
    } catch (error) {
      console.error("Error updating banner:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid banner data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update banner" });
      }
    }
  });

  // Update collection (admin only)
  app.put("/api/admin/collections/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const collectionData = insertCollectionSchema.parse(req.body);
      const collection = await storage.updateCollection(id, collectionData);
      res.json(collection);
    } catch (error) {
      console.error("Error updating collection:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid collection data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update collection" });
      }
    }
  });

  // Update content (admin only)
  app.put("/api/admin/content/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const contentData = insertContentSchema.parse(req.body);
      const content = await storage.updateContent(id, contentData);
      res.json(content);
    } catch (error) {
      console.error("Error updating content:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid content data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update content" });
      }
    }
  });

  // Update notification (admin only)
  app.put("/api/admin/notifications/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const notificationData = insertNotificationSchema.parse(req.body);
      // updateNotification doesn't exist, using a custom update approach
      const [notification] = await db.update(notifications).set(notificationData as any).where(eq(notifications.id, id)).returning();
      res.json(notification);
    } catch (error) {
      console.error("Error updating notification:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid notification data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update notification" });
      }
    }
  });

  // Update user session (admin only)
  app.put("/api/admin/user-sessions/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const sessionData = insertUserSessionSchema.parse(req.body);
      // updateUserSession doesn't exist, using a custom update approach
      const [session] = await db.update(userSessions).set(sessionData as any).where(eq(userSessions.id, id)).returning();
      res.json(session);
    } catch (error) {
      console.error("Error updating user session:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid session data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update user session" });
      }
    }
  });

  // Update view tracking (admin only)
  app.put("/api/admin/view-tracking/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const trackingData = insertViewTrackingSchema.parse(req.body);
      // updateViewTracking doesn't exist, using a custom update approach
      const [tracking] = await db.update(viewTracking).set(trackingData as any).where(eq(viewTracking.id, id)).returning();
      res.json(tracking);
    } catch (error) {
      console.error("Error updating view tracking:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid tracking data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update view tracking" });
      }
    }
  });

  // Delete favorite (admin only)
  app.delete("/api/admin/favorites/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      // deleteFavorite doesn't exist, using a custom delete approach
      await db.delete(favorites).where(eq(favorites.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting favorite:", error);
      res.status(500).json({ error: "Failed to delete favorite" });
    }
  });

  // Delete watch history (admin only)
  app.delete("/api/admin/watch-history/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      // deleteWatchHistory doesn't exist, using a custom delete approach
      await db.delete(watchHistory).where(eq(watchHistory.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting watch history:", error);
      res.status(500).json({ error: "Failed to delete watch history" });
    }
  });

  // Delete user preference (admin only)
  app.delete("/api/admin/user-preferences/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUserPreferences(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user preference:", error);
      res.status(500).json({ error: "Failed to delete user preference" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Delete subscription (admin only)
  app.delete("/api/admin/subscriptions/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSubscription(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting subscription:", error);
      res.status(500).json({ error: "Failed to delete subscription" });
    }
  });

  // Delete payment (admin only)
  app.delete("/api/admin/payments/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePayment(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({ error: "Failed to delete payment" });
    }
  });

  // Delete banner (admin only)
  app.delete("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBanner(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting banner:", error);
      res.status(500).json({ error: "Failed to delete banner" });
    }
  });

  // Delete collection (admin only)
  app.delete("/api/admin/collections/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCollection(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting collection:", error);
      res.status(500).json({ error: "Failed to delete collection" });
    }
  });

  // Delete content (admin only)
  app.delete("/api/admin/content/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteContent(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).json({ error: "Failed to delete content" });
    }
  });

  // Delete notification (admin only)
  app.delete("/api/admin/notifications/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNotification(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  // Delete user session (admin only)
  app.delete("/api/admin/user-sessions/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUserSession(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user session:", error);
      res.status(500).json({ error: "Failed to delete user session" });
    }
  });

  // Delete view tracking (admin only)
  app.delete("/api/admin/view-tracking/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteViewTracking(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting view tracking:", error);
      res.status(500).json({ error: "Failed to delete view tracking" });
    }
  });



  // Subscribe to a plan
  app.post("/api/subscribe", async (req, res) => {
    try {
      const { planId, paymentToken } = req.body;
      
      if (!req.user) {
        securityLogger.logUnauthorizedAccess(req.ip || 'unknown', req.path);
        return res.status(401).json({ error: "Non authentifié" });
      }
      
      const user = await storage.getUserById(req.user.userId);
      if (!user) {
        securityLogger.logUnauthorizedAccess(req.ip || 'unknown', req.path, req.user.userId);
        return res.status(401).json({ error: "Non authentifié" });
      }
      
      const plan = plans[planId as keyof typeof plans];
      if (!plan) {
        return res.status(400).json({ error: "Plan invalide" });
      }
      
      // Process payment
      const customerInfo: CustomerInfo = {
        email: user.email,
        name: user.username
      };
      
      const paymentResult = await paymentService.createLygosPayment(planId, customerInfo, user.id);
      
      // For free plans or successful payments, create the subscription
      if (plan.amount === 0 || paymentResult.paymentLink) {
        // Update user subscription
        const subscriptionData = {
          userId: user.id,
          planId: planId,
          amount: plan.amount,
          paymentMethod: 'lygos',
          startDate: new Date(),
          endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
          status: 'active'
        };
        const subscription = await storage.createSubscription(subscriptionData);
        
        // Save payment information for paid plans
        if (plan.amount > 0 && paymentResult.paymentId) {
          const paymentData = {
            userId: user.id,
            amount: plan.amount,
            method: 'lygos',
            subscriptionId: subscription.id,
            transactionId: paymentResult.paymentId,
            status: 'pending'
          };
          await storage.createPayment(paymentData);
        }
        
        res.json({ 
          success: true, 
          message: "Abonnement réussi", 
          subscription,
          paymentLink: paymentResult.paymentLink
        });
      } else {
        return res.status(400).json({ error: paymentResult.error || "Échec du paiement" });
      }
    } catch (error) {
      console.error("Error subscribing to plan:", error);
      res.status(500).json({ error: "Erreur lors de l'abonnement" });
    }
  });

  // Get user subscription
  app.get("/api/subscription/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const subscription = await storage.getUserSubscription(userId);
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      res.status(500).json({ error: "Erreur lors de la récupération de l'abonnement" });
    }
  });

  // Cancel user subscription
  app.post("/api/subscription/:userId/cancel", async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!req.user) {
        securityLogger.logUnauthorizedAccess(req.ip || 'unknown', req.path);
        return res.status(401).json({ error: "Non authentifié" });
      }
      
      const user = await storage.getUserById(req.user.userId);
      if (!user) {
        securityLogger.logUnauthorizedAccess(req.ip || 'unknown', req.path, req.user.userId);
        return res.status(401).json({ error: "Non authentifié" });
      }
      
      const subscription = await storage.getUserSubscription(userId);
      if (!subscription) {
        return res.status(404).json({ error: "Aucun abonnement trouvé pour cet utilisateur" });
      }
      
      // Cancel subscription
      await storage.updateSubscription(subscription.id, { status: 'cancelled' });
      
      res.json({ 
        success: true, 
        message: "Abonnement annulé avec succès" 
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ error: "Erreur lors de l'annulation de l'abonnement" });
    }
  });

  // Get CSRF token
  app.get("/api/csrf-token", async (req: any, res: any) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: "Non authentifié" });
      }
      
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const csrfToken = generateCSRFToken(req.user.userId, userAgent, ipAddress);
      res.json({ csrfToken });
    } catch (error) {
      console.error("Error generating CSRF token:", error);
      res.status(500).json({ error: "Erreur lors de la génération du jeton CSRF" });
    }
  });

  // Get banner by ID
  app.get("/api/banners/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const banner = await storage.getBannerById(id);
      if (!banner) {
        return res.status(404).json({ error: "Bannière non trouvée" });
      }
      res.json(banner);
    } catch (error) {
      console.error("Error fetching banner:", error);
      res.status(500).json({ error: "Erreur lors de la récupération de la bannière" });
    }
  });

  // Get banners by collection ID
  app.get("/api/banners/collection/:collectionId", async (req, res) => {
    try {
      const { collectionId } = req.params;
      const banners = await storage.getBannersByCollectionId(collectionId);
      res.json(banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des bannières" });
    }
  });

  // Get collections
  app.get("/api/collections", async (req, res) => {
    try {
      const collections = await storage.getAllCollections();
      res.json(collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des collections" });
    }
  });

  // Get collection by ID
  app.get("/api/collections/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const collection = await storage.getCollectionById(id);
      if (!collection) {
        return res.status(404).json({ error: "Collection non trouvée" });
      }
      res.json(collection);
    } catch (error) {
      console.error("Error fetching collection:", error);
      res.status(500).json({ error: "Erreur lors de la récupération de la collection" });
    }
  });

  // Get contents by collection ID
  app.get("/api/content/collection/:collectionId", async (req, res) => {
    try {
      const { collectionId } = req.params;
      const contents = await storage.getContentsByCollectionId(collectionId);
      res.json(contents);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ error: "Erreur lors de la récupération du contenu" });
    }
  });

  // Get content by ID
  app.get("/api/content/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const content = await storage.getContentById(id);
      if (!content) {
        return res.status(404).json({ error: "Contenu non trouvé" });
      }
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ error: "Erreur lors de la récupération du contenu" });
    }
  });

  // Get content by slug
  app.get("/api/content/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const content = await storage.getContentBySlug(slug);
      if (!content) {
        return res.status(404).json({ error: "Contenu non trouvé" });
      }
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ error: "Erreur lors de la récupération du contenu" });
    }
  });

  // Get content by type
  app.get("/api/content/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const contents = await storage.getContentByType(type);
      res.json(contents);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ error: "Erreur lors de la récupération du contenu" });
    }
  });

  // Get content by genre
  app.get("/api/content/genre/:genre", async (req, res) => {
    try {
      const { genre } = req.params;
      const contents = await storage.getContentByGenre(genre);
      res.json(contents);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ error: "Erreur lors de la récupération du contenu" });
    }
  });

  // Get content by year
  app.get("/api/content/year/:year", async (req, res) => {
    try {
      const { year } = req.params;
      const contents = await storage.getContentByYear(year);
      res.json(contents);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ error: "Erreur lors de la récupération du contenu" });
    }
  });

  // Get notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des notifications" });
    }
  });

  // Get notifications by user ID
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des notifications" });
    }
  });

  // Get user session by token
  app.get("/api/user-sessions", async (req, res) => {
    try {
      const { token } = req.query;
      if (typeof token !== 'string') {
        return res.status(400).json({ error: "Token is required" });
      }
      const session = await storage.getUserSessionByToken(token);
      res.json(session);
    } catch (error) {
      console.error("Error fetching user session:", error);
      res.status(500).json({ error: "Erreur lors de la récupération de la session utilisateur" });
    }
  });

  // Get user session by user ID
  app.get("/api/user-sessions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const session = await storage.getUserSessionByUserId(userId);
      res.json(session);
    } catch (error) {
      console.error("Error fetching user session:", error);
      res.status(500).json({ error: "Erreur lors de la récupération de la session utilisateur" });
    }
  });

  // Get view tracking by user ID
  app.get("/api/view-tracking/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const tracking = await storage.getViewTrackingByUserId(userId);
      res.json(tracking);
    } catch (error) {
      console.error("Error fetching view tracking:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des données de suivi" });
    }
  });

  // Get view tracking by content ID
  app.get("/api/view-tracking/content/:contentId", async (req, res) => {
    try {
      // Since we don't have a direct function to get view tracking by content ID,
      // we'll need to implement this differently or remove this route
      res.status(500).json({ error: "Not implemented" });
    } catch (error) {
      console.error("Error fetching view tracking:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des données de suivi" });
    }
  });

  // Get view tracking by user ID and content ID
  app.get("/api/view-tracking/:userId/:contentId", async (req, res) => {
    try {
      // Since we don't have a direct function to get view tracking by user ID and content ID,
      // we'll need to implement this differently or remove this route
      res.status(500).json({ error: "Not implemented" });
    } catch (error) {
      console.error("Error fetching view tracking:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des données de suivi" });
    }
  });
  // Get all favorites (admin only)
  app.get("/api/admin/favorites", requireAdmin, async (req, res) => {
    try {
      const favorites = await storage.getAllFavorites();
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching all favorites:", error);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  // Get all notifications (admin only)
  app.get("/api/admin/notifications", requireAdmin, async (req, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Get user notifications
  app.get("/api/notifications", authenticateToken, async (req: any, res: any) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Non authentifié" });
      }
      
      const notifications = await storage.getUserNotifications(req.user.userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.put("/api/notifications/:id/read", authenticateToken, async (req: any, res: any) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Non authentifié" });
      }
      
      const { id } = req.params;
      
      // First verify that the notification belongs to the user
      const notification = await storage.getNotificationById(id);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      
      if (notification.userId !== req.user.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.markNotificationRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Send notification (admin only)
  app.post("/api/admin/notifications/send", requireAdmin, async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.json(notification);
    } catch (error) {
      console.error("Error sending notification:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid notification data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to send notification" });
      }
    }
  });

  // Get subscriptions (admin only)
  app.get("/api/admin/subscriptions", requireAdmin, async (req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      // Remove sensitive data from response
      const sanitizedSubscriptions = subscriptions.map(sub => ({
        ...sub,
        userId: undefined, // Don't expose user IDs in admin panel for privacy
      }));
      res.json(sanitizedSubscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ error: "Failed to fetch subscriptions", details: (error as Error).message });
    }
  });

  // Get payments (admin only)
  app.get("/api/admin/payments", requireAdmin, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  // Get analytics (admin only)
  app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      // We'll implement this by getting data from various sources
      const users = await storage.getAllUsers();
      const subscriptions = await storage.getSubscriptions();
      const payments = await storage.getPayments();
      const viewStats = await storage.getViewStats();
      
      const analytics = {
        users: users.length,
        subscriptions: subscriptions.length,
        payments: payments.length,
        viewStats
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Get banners (admin only)
  app.get("/api/admin/banners", requireAdmin, async (req, res) => {
    try {
      const banners = await storage.getBanners();
      res.json(banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
      res.status(500).json({ error: "Failed to fetch banners" });
    }
  });

  // Update banner (admin only)
  app.put("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const bannerData = insertBannerSchema.parse(req.body);
      const banner = await storage.updateBanner(id, bannerData);
      res.json(banner);
    } catch (error) {
      console.error("Error updating banner:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid banner data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update banner" });
      }
    }
  });

  // Get collections (admin only)
  app.get("/api/admin/collections", requireAdmin, async (req, res) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  // Get content (admin only)
  app.get("/api/admin/content", requireAdmin, async (req, res) => {
    try {
      const content = await storage.getContent();
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // Create content (admin only)
  app.post("/api/admin/content", requireAdmin, async (req, res) => {
    try {
      const contentData = insertContentSchema.parse(req.body);
      
      // Check if content with this TMDB ID already exists
      const existingContent = await storage.getContentByTmdbId(contentData.tmdbId);
      if (existingContent) {
        return res.status(400).json({ error: "Ce contenu existe déjà dans la plateforme" });
      }
      
      const content = await storage.createContent(contentData);
      res.json({ success: true, message: "Contenu ajouté", content });
    } catch (error) {
      console.error("Error creating content:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid content data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create content" });
      }
    }
  });

  app.put("/api/admin/content/:contentId", requireAdmin, async (req: any, res: any) => {
    try {
      const { contentId } = req.params;
      const contentData = insertContentSchema.partial().parse(req.body);
      
      // Decode HTML entities in the odyseeUrl if present
      if (contentData.odyseeUrl) {
        try {
          // Simple HTML entity decoding
          contentData.odyseeUrl = contentData.odyseeUrl
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#x2F;/g, '/')
            .replace(/&#39;/g, "'");
        } catch (e) {
          // If we can't decode, just use the original URL
          // The validation will catch any issues
        }
      }
      
      const content = await storage.updateContent(contentId, contentData);
      res.json({ success: true, message: "Contenu mis à jour", content });
    } catch (error) {
      console.error("Error updating content:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid content data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update content" });
      }
    }
  });

  app.delete("/api/admin/content/:contentId", requireAdmin, async (req: any, res: any) => {
    try {
      const { contentId } = req.params;
      await storage.deleteContent(contentId);
      res.json({ success: true, message: "Contenu supprimé" });
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).json({ error: "Failed to delete content" });
    }
  });

  // Add video link to existing content by TMDB ID (admin only)
  app.post("/api/contents/add-link", requireAdmin, async (req: any, res: any) => {
    try {
      const { tmdbId, videoUrl } = req.body;
      
      // Validate input
      if (!tmdbId || !videoUrl) {
        return res.status(400).json({ error: "tmdbId and videoUrl are required" });
      }
      
      // Decode HTML entities in the URL
      let cleanVideoUrl = videoUrl;
      try {
        // Simple HTML entity decoding
        cleanVideoUrl = videoUrl
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x2F;/g, '/')
          .replace(/&#39;/g, "'");
      } catch (e) {
        // If we can't decode, just use the original URL
        cleanVideoUrl = videoUrl;
      }
      
      // Validate URL format
      try {
        new URL(cleanVideoUrl);
      } catch (urlError) {
        return res.status(400).json({ error: "Invalid URL format" });
      }
      
      // Check if it's a supported video platform
      const supportedPlatforms = [
        'odysee.com',
        'youtube.com',
        'youtu.be',
        'vimeo.com',
        'mux.com',
        'player.mux.com',
        '.mp4',
        '.webm',
        '.ogg',
        '.mov',
        '.avi',
        '.wmv',
        '.flv',
        '.mkv',
        '.m3u8',
        '.ts'
      ];
      
      const isSupported = supportedPlatforms.some(platform => 
        cleanVideoUrl.includes(platform)
      );
      
      if (!isSupported) {
        return res.status(400).json({ 
          error: "URL is not from a recognized video platform",
          supported_platforms: "Odysee, YouTube, Vimeo, Mux, and direct video files"
        });
      }
      
      // Check if content with this TMDB ID already exists (regardless of active status)
      let existingContent = await storage.getContentByTmdbIdAnyStatus(tmdbId);
      
      if (existingContent) {
        // Update existing content with video URL
        const updatedContent = await storage.updateContent(existingContent.id, { 
          odyseeUrl: cleanVideoUrl,
          active: true // Ensure content is active when adding a video link
        });
        res.json({ 
          success: true, 
          message: "Lien vidéo mis à jour", 
          content: updatedContent 
        });
      } else {
        // Return error if content doesn't exist
        return res.status(404).json({ 
          error: "Content not found. Please add the content first before adding a video link." 
        });
      }
    } catch (error) {
      console.error("Error adding video link:", error);
      res.status(500).json({ error: "Failed to add video link" });
    }
  });

  // Get all contents with video links (for admin panel)
  app.get("/api/contents/tmdb", requireAdmin, async (req: any, res: any) => {
    try {
      const contents = await storage.getAllContent();
      res.json(contents);
    } catch (error) {
      console.error("Error fetching contents:", error);
      res.status(500).json({ error: "Failed to fetch contents" });
    }
  });

  // Admin routes for episode management
  app.post("/api/admin/episodes", requireAdmin, async (req: any, res: any) => {
    try {
      const { contentId, seasonNumber, episodeNumber, title, description, odyseeUrl, releaseDate } = req.body;
      
      // Validate required fields
      if (!contentId || !seasonNumber || !episodeNumber || !title) {
        return res.status(400).json({ error: "Les champs contentId, seasonNumber, episodeNumber et title sont requis" });
      }
      
      // Check if content exists and is a TV series
      const existingContent = await storage.getContentById(contentId);
      if (!existingContent) {
        return res.status(404).json({ error: "Contenu non trouvé" });
      }
      
      if (existingContent.mediaType !== 'tv') {
        return res.status(400).json({ error: "Le contenu doit être une série TV" });
      }
      
      // Check if episode already exists
      const existingEpisodes = await storage.getEpisodesByContentId(contentId);
      const episodeExists = existingEpisodes.some(
        ep => ep.seasonNumber === seasonNumber && ep.episodeNumber === episodeNumber
      );
      
      if (episodeExists) {
        return res.status(400).json({ error: "Cet épisode existe déjà pour cette saison" });
      }
      
      // Create episode
      const episodeData = {
        contentId,
        seasonNumber,
        episodeNumber,
        title,
        description: description || '',
        odyseeUrl: odyseeUrl || '',
        releaseDate: releaseDate || '',
        active: true
      };
      
      const newEpisode = await storage.createEpisode(episodeData);
      
      res.status(201).json({ 
        success: true, 
        message: "Épisode créé avec succès",
        episode: newEpisode
      });
    } catch (error) {
      console.error("Error creating episode:", error);
      res.status(500).json({ error: "Erreur lors de la création de l'épisode" });
    }
  });

  app.get("/api/admin/episodes/:contentId", requireAdmin, async (req: any, res: any) => {
    try {
      const { contentId } = req.params;
      
      if (!contentId) {
        return res.status(400).json({ error: "ID du contenu requis" });
      }
      
      const episodes = await storage.getEpisodesByContentId(contentId);
      res.json({ episodes });
    } catch (error) {
      console.error("Error fetching episodes:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des épisodes" });
    }
  });

  app.post("/api/admin/episodes", requireAdmin, async (req: any, res: any) => {
    try {
      const episodeData = req.body;
      
      if (!episodeData.contentId || !episodeData.seasonNumber || !episodeData.episodeNumber || !episodeData.title) {
        return res.status(400).json({ error: "Données d'épisode incomplètes" });
      }
      
      const episode = await storage.createEpisode(episodeData);
      res.json(episode);
    } catch (error) {
      console.error("Error creating episode:", error);
      res.status(500).json({ error: "Erreur lors de la création de l'épisode" });
    }
  });

  app.put("/api/admin/episodes/:episodeId", requireAdmin, async (req: any, res: any) => {
    try {
      const { episodeId } = req.params;
      const updateData = req.body;
      
      if (!episodeId) {
        return res.status(400).json({ error: "ID de l'épisode requis" });
      }
      
      const episode = await storage.updateEpisode(episodeId, updateData);
      res.json(episode);
    } catch (error) {
      console.error("Error updating episode:", error);
      res.status(500).json({ error: "Erreur lors de la mise à jour de l'épisode" });
    }
  });

  app.delete("/api/admin/episodes/:episodeId", requireAdmin, async (req: any, res: any) => {
    try {
      const { episodeId } = req.params;
      
      if (!episodeId) {
        return res.status(400).json({ error: "ID de l'épisode requis" });
      }
      
      await storage.deleteEpisode(episodeId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting episode:", error);
      res.status(500).json({ error: "Erreur lors de la suppression de l'épisode" });
    }
  });

  // Test endpoint to check content
  app.get("/api/test-content", async (req: any, res: any) => {
    try {
      const contents = await storage.getAllContent();
      res.json({ contents });
    } catch (error) {
      console.error("Error fetching test content:", error);
      res.status(500).json({ error: "Failed to fetch test content" });
    }
  });

  // Get content by TMDB ID (for frontend player)
  app.get("/api/contents/tmdb/:tmdbId", async (req: any, res: any) => {
    try {
      const { tmdbId } = req.params;
      
      // Validate input
      if (!tmdbId) {
        return res.status(400).json({ error: "tmdbId is required" });
      }
      
      const tmdbIdNum = parseInt(tmdbId);
      if (isNaN(tmdbIdNum)) {
        return res.status(400).json({ error: "Invalid tmdbId format" });
      }
      
      // Get content by TMDB ID
      const content = await storage.getContentByTmdbId(tmdbIdNum);
      
      if (!content) {
        // Return a default content object with empty video URL instead of 404
        return res.json({
          id: `tmdb-${tmdbIdNum}`,
          tmdbId: tmdbIdNum,
          odyseeUrl: "",
          active: false,
          createdAt: new Date().toISOString()
        });
      }
      
      // Only return content if it has a video URL
      if (!content.odyseeUrl) {
        // Return content with empty URL instead of 404
        return res.json({
          ...content,
          odyseeUrl: ""
        });
      }
      
      res.json(content);
    } catch (error) {
      console.error("Error fetching content by TMDB ID:", error);
      // Return a default content object with empty video URL instead of error
      const { tmdbId } = req.params;
      const tmdbIdNum = parseInt(tmdbId);
      res.json({
        id: `tmdb-${tmdbIdNum}`,
        tmdbId: tmdbIdNum,
        odyseeUrl: "",
        active: false,
        createdAt: new Date().toISOString()
      });
    }
  });

  // Import popular movies and TV shows from TMDB
  app.post("/api/admin/import-content", requireAdmin, async (req: any, res: any) => {
    try {
      // Verify that user is authenticated as admin
      if (!req.user) {
        return res.status(401).json({ error: "Non authentifié" });
      }
      
      // Verify that user is admin
      const user = await storage.getUserById(req.user.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Accès administrateur requis" });
      }
      
      console.log("Starting content import from TMDB...");
      
      let totalMoviesAdded = 0;
      let totalTVShowsAdded = 0;
      
      // Import popular movies (first 3 pages = 60 movies)
      console.log("\n--- Importing Popular Movies ---");
      for (let page = 1; page <= 3; page++) {
        console.log(`\nProcessing page ${page} of popular movies...`);
        
        // Fetch movies from TMDB
        const apiKey = process.env.TMDB_API_KEY;
        if (!apiKey) {
          return res.status(500).json({ error: "TMDB API key not configured" });
        }
        
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=fr-FR&page=${page}`
        );
        
        if (!response.ok) {
          console.error(`TMDB API error: ${response.status} ${response.statusText}`);
          continue;
        }
        
        const data = await response.json();
        const movies = data.results || [];
        
        if (movies.length === 0) {
          console.log("No movies found, stopping import");
          break;
        }
        
        // Add each movie to database
        for (const movie of movies) {
          try {
            // Check if movie already exists
            const existingContent = await storage.getContentByTmdbIdAnyStatus(movie.id);
            if (existingContent) {
              console.log(`Movie "${movie.title}" (TMDB ID: ${movie.id}) already exists in database`);
              continue;
            }
            
            // Prepare content data
            const contentData = {
              tmdbId: movie.id,
              title: movie.title,
              description: movie.overview,
              posterPath: movie.poster_path,
              backdropPath: movie.backdrop_path,
              releaseDate: movie.release_date,
              genres: movie.genre_ids || [],
              odyseeUrl: '', // Empty by default, will be filled when video link is added
              muxPlaybackId: '',
              muxUrl: '',
              language: 'vf', // Default to French
              quality: 'hd', // Default to HD
              mediaType: 'movie',
              rating: Math.round(movie.vote_average * 10), // Convert to 0-100 scale
              active: true
            };
            
            // Add to database
            const newContent = await storage.createContent(contentData);
            console.log(`Added movie "${movie.title}" (TMDB ID: ${movie.id}) to database with ID: ${newContent.id}`);
            totalMoviesAdded++;
            
            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (error) {
            console.error(`Error adding movie "${movie.title}" to database:`, error);
          }
        }
      }
      
      // Import popular TV shows (first 3 pages = 60 shows)
      console.log("\n--- Importing Popular TV Shows ---");
      for (let page = 1; page <= 3; page++) {
        console.log(`\nProcessing page ${page} of popular TV shows...`);
        
        // Fetch TV shows from TMDB
        const apiKey = process.env.TMDB_API_KEY;
        if (!apiKey) {
          return res.status(500).json({ error: "TMDB API key not configured" });
        }
        
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=fr-FR&page=${page}`
        );
        
        if (!response.ok) {
          console.error(`TMDB API error: ${response.status} ${response.statusText}`);
          continue;
        }
        
        const data = await response.json();
        const shows = data.results || [];
        
        if (shows.length === 0) {
          console.log("No TV shows found, stopping import");
          break;
        }
        
        // Add each TV show to database
        for (const show of shows) {
          try {
            // Check if TV show already exists
            const existingContent = await storage.getContentByTmdbIdAnyStatus(show.id);
            if (existingContent) {
              console.log(`TV show "${show.name}" (TMDB ID: ${show.id}) already exists in database`);
              continue;
            }
            
            // Prepare content data
            const contentData = {
              tmdbId: show.id,
              title: show.name,
              description: show.overview,
              posterPath: show.poster_path,
              backdropPath: show.backdrop_path,
              releaseDate: show.first_air_date,
              genres: show.genre_ids || [],
              odyseeUrl: '', // Empty by default, will be filled when video link is added
              muxPlaybackId: '',
              muxUrl: '',
              language: 'vf', // Default to French
              quality: 'hd', // Default to HD
              mediaType: 'tv',
              rating: Math.round(show.vote_average * 10), // Convert to 0-100 scale
              active: true
            };
            
            // Add to database
            const newContent = await storage.createContent(contentData);
            console.log(`Added TV show "${show.name}" (TMDB ID: ${show.id}) to database with ID: ${newContent.id}`);
            totalTVShowsAdded++;
            
            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (error) {
            console.error(`Error adding TV show "${show.name}" to database:`, error);
          }
        }
      }
      
      console.log("\n--- Import Summary ---");
      console.log(`Total movies added: ${totalMoviesAdded}`);
      console.log(`Total TV shows added: ${totalTVShowsAdded}`);
      
      res.json({ 
        success: true, 
        message: "Content import completed successfully",
        moviesAdded: totalMoviesAdded,
        tvShowsAdded: totalTVShowsAdded
      });
    } catch (error) {
      console.error("Error importing content:", error);
      res.status(500).json({ error: "Failed to import content: " + (error as Error).message });
    }
  });

  // Search for content on TMDB
  app.post("/api/admin/search-content", requireAdmin, async (req: any, res: any) => {
    try {
      // Verify that user is authenticated as admin
      if (!req.user) {
        return res.status(401).json({ error: "Non authentifié" });
      }
      
      // Verify that user is admin
      const user = await storage.getUserById(req.user.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Accès administrateur requis" });
      }
      
      const { query, page = 1 } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
      }
      
      console.log(`Searching for content on TMDB with query: "${query}"...`);
      
      // Search for movies and TV shows
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }
      
      // Search for movies
      const movieResponse = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=fr-FR&query=${encodeURIComponent(query)}&page=${page}`
      );
      
      if (!movieResponse.ok) {
        console.error(`TMDB API error for movies: ${movieResponse.status} ${movieResponse.statusText}`);
        return res.status(500).json({ error: "Failed to search for movies" });
      }
      
      const movieData = await movieResponse.json();
      const movies = movieData.results || [];
      
      // Search for TV shows
      const tvResponse = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=fr-FR&query=${encodeURIComponent(query)}&page=${page}`
      );
      
      if (!tvResponse.ok) {
        console.error(`TMDB API error for TV shows: ${tvResponse.status} ${tvResponse.statusText}`);
        return res.status(500).json({ error: "Failed to search for TV shows" });
      }
      
      const tvData = await tvResponse.json();
      const tvShows = tvData.results || [];
      
      console.log(`Found ${movies.length} movies and ${tvShows.length} TV shows for query "${query}"`);
      
      res.json({ 
        success: true,
        movies,
        tvShows,
        totalPages: Math.max(movieData.total_pages || 0, tvData.total_pages || 0),
        totalResults: (movieData.total_results || 0) + (tvData.total_results || 0)
      });
    } catch (error) {
      console.error("Error searching content:", error);
      res.status(500).json({ error: "Failed to search content: " + (error as Error).message });
    }
  });

  // Import specific content by TMDB ID
  app.post("/api/admin/import-content-by-id", requireAdmin, async (req: any, res: any) => {
    try {
      // Verify that user is authenticated as admin
      if (!req.user) {
        return res.status(401).json({ error: "Non authentifié" });
      }
      
      // Verify that user is admin
      const user = await storage.getUserById(req.user.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Accès administrateur requis" });
      }
      
      const { tmdbId, mediaType } = req.body;
      
      if (!tmdbId || !mediaType) {
        return res.status(400).json({ error: "tmdbId and mediaType parameters are required" });
      }
      
      console.log(`Importing ${mediaType} with TMDB ID: ${tmdbId}`);
      
      // Fetch content details from TMDB
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }
      
      const response = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${apiKey}&language=fr-FR`
      );
      
      if (!response.ok) {
        console.error(`TMDB API error: ${response.status} ${response.statusText}`);
        return res.status(500).json({ error: "Failed to fetch content details" });
      }
      
      const content = await response.json();
      
      // Check if content already exists
      const existingContent = await storage.getContentByTmdbIdAnyStatus(tmdbId);
      if (existingContent) {
        return res.status(400).json({ error: "Content already exists in database" });
      }
      
      // Prepare content data
      let contentData;
      if (mediaType === 'movie') {
        contentData = {
          tmdbId: content.id,
          title: content.title,
          description: content.overview,
          posterPath: content.poster_path,
          backdropPath: content.backdrop_path,
          releaseDate: content.release_date,
          genres: content.genres ? content.genres.map((g: any) => g.id) : [],
          odyseeUrl: '', // Empty by default, will be filled when video link is added
          muxPlaybackId: '',
          muxUrl: '',
          language: 'vf', // Default to French
          quality: 'hd', // Default to HD
          mediaType: 'movie',
          rating: Math.round(content.vote_average * 10), // Convert to 0-100 scale
          active: true
        };
      } else if (mediaType === 'tv') {
        contentData = {
          tmdbId: content.id,
          title: content.name,
          description: content.overview,
          posterPath: content.poster_path,
          backdropPath: content.backdrop_path,
          releaseDate: content.first_air_date,
          genres: content.genres ? content.genres.map((g: any) => g.id) : [],
          odyseeUrl: '', // Empty by default, will be filled when video link is added
          muxPlaybackId: '',
          muxUrl: '',
          language: 'vf', // Default to French
          quality: 'hd', // Default to HD
          mediaType: 'tv',
          rating: Math.round(content.vote_average * 10), // Convert to 0-100 scale
          active: true
        };
      } else {
        return res.status(400).json({ error: "Invalid mediaType. Must be 'movie' or 'tv'" });
      }
      
      // Add to database
      const newContent = await storage.createContent(contentData);
      console.log(`Added ${mediaType} "${contentData.title}" (TMDB ID: ${content.id}) to database with ID: ${newContent.id}`);
      
      res.json({ 
        success: true,
        message: `${mediaType === 'movie' ? 'Movie' : 'TV show'} imported successfully`,
        content: newContent
      });
    } catch (error) {
      console.error("Error importing content by ID:", error);
      res.status(500).json({ error: "Failed to import content: " + (error as Error).message });
    }
  });

  // Debug endpoint to check content status
  app.get("/api/debug/content/:tmdbId", async (req: any, res: any) => {
    try {
      const { tmdbId } = req.params;
      
      // Validate input
      if (!tmdbId) {
        return res.status(400).json({ error: "tmdbId is required" });
      }
      
      const tmdbIdNum = parseInt(tmdbId);
      if (isNaN(tmdbIdNum)) {
        return res.status(400).json({ error: "Invalid tmdbId format" });
      }
      
      // Get content by TMDB ID regardless of status
      const content = await storage.getContentByTmdbIdAnyStatus(tmdbIdNum);
      
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      
      res.json({
        content: {
          id: content.id,
          tmdbId: content.tmdbId,
          title: content.title,
          active: content.active,
          odyseeUrl: content.odyseeUrl,
          mediaType: content.mediaType,
          createdAt: content.createdAt,
          updatedAt: content.updatedAt
        }
      });
    } catch (error) {
      console.error("Error fetching content by TMDB ID:", error);
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // Test video link (admin only)
  app.post("/api/admin/test-video-link", requireAdmin, async (req: any, res: any) => {
    try {
      const { videoLink } = req.body;
      
      if (!videoLink) {
        return res.status(400).json({ error: "Video link is required" });
      }
      
      console.log(`Testing video link: ${videoLink}`);
      
      try {
        const response = await fetch(videoLink);
        if (!response.ok) {
          return res.status(400).json({
            error: "Failed to test video link",
            details: `HTTP ${response.status} ${response.statusText}`
          });
        }
        
        res.json({ success: true, message: "Video link is valid" });
      } catch (fetchError: any) {
        return res.status(400).json({
          error: "Failed to test video link",
          details: fetchError.message
        });
      }
    } catch (error) {
      console.error("Error testing video link:", error);
      res.status(500).json({ error: "Failed to test video link" });
    }
  });

  // Get analytics data (admin only)
  app.get("/api/admin/analytics", requireAdmin, async (req: any, res: any) => {
    try {
      // Get total users
      const allUsers = await storage.getAllUsers();
      const totalUsers = allUsers.length;
      
      // Get active users (users with recent activity)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const activeUsers = allUsers.filter(user => {
        // For now, we'll consider all users as active
        // In a real implementation, you might check last login time or activity
        return !user.banned; // Non-banned users are considered active
      }).length;
      
      // Get new users this week
      const newUsersThisWeek = allUsers.filter(user => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= oneWeekAgo;
      }).length;
      
      // Get all content
      const allContent = await storage.getAllContent();
      const totalMovies = allContent.filter(c => c.mediaType === 'movie').length;
      const totalSeries = allContent.filter(c => c.mediaType === 'tv').length;
      
      // Get view stats
      const viewStats = await storage.getViewStats();
      
      // Get subscriptions
      const allSubscriptions = await storage.getSubscriptions();
      const activeSubscriptions = allSubscriptions.filter(s => s.status === 'active');
      const activeSubscriptionsCount = activeSubscriptions.length;
      
      // Get active sessions
      const activeSessions = await storage.getActiveSessions();
      const activeSessionsCount = activeSessions.length;
      
      // Calculate revenue
      const allPayments = await storage.getPayments();
      const monthlyPayments = allPayments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return paymentDate >= oneMonthAgo;
      });
      
      const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      // Calculate growth (simplified - comparing this month to last month)
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const lastMonthPayments = allPayments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return paymentDate >= twoMonthsAgo && paymentDate < oneMonthAgo;
      });
      
      const lastMonthRevenue = lastMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const growth = lastMonthRevenue > 0 ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;
      
      // Subscription plan counts
      const basicCount = activeSubscriptions.filter(s => s.planId === 'basic').length;
      const standardCount = activeSubscriptions.filter(s => s.planId === 'standard').length;
      const premiumCount = activeSubscriptions.filter(s => s.planId === 'premium').length;
      
      // Recent activity
      const today = new Date();
      const newUsersToday = allUsers.filter(user => {
        const createdAt = new Date(user.createdAt);
        return createdAt.toDateString() === today.toDateString();
      }).length;
      
      const newMoviesAdded = allContent.filter(content => {
        const createdAt = new Date(content.createdAt);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return createdAt >= oneWeekAgo;
      }).length;
      
      const analyticsData = {
        totalUsers,
        activeUsers,
        newUsersThisWeek,
        totalMovies,
        totalSeries,
        dailyViews: viewStats.dailyViews,
        weeklyViews: viewStats.weeklyViews,
        activeSubscriptionsCount,
        activeSessions: activeSessionsCount,
        revenue: {
          monthly: monthlyRevenue,
          growth,
          totalPayments: allPayments.length
        },
        subscriptions: {
          basic: basicCount,
          standard: standardCount,
          premium: premiumCount
        },
        recentActivity: {
          newMoviesAdded,
          newUsersToday
        }
      };
      
      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  // Analytics stream (SSE) - simplified implementation
  app.get("/api/admin/analytics/stream", requireAdmin, (req: any, res: any) => {
    try {
      // Set SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      
      // Send initial data
      storage.getAllUsers().then(async (allUsers) => {
        const totalUsers = allUsers.length;
        const activeUsers = allUsers.filter(user => !user.banned).length;
        
        const allContent = await storage.getAllContent();
        const totalMovies = allContent.filter(c => c.mediaType === 'movie').length;
        const totalSeries = allContent.filter(c => c.mediaType === 'tv').length;
        
        const viewStats = await storage.getViewStats();
        
        const analyticsData = {
          totalUsers,
          activeUsers,
          newUsersThisWeek: 0, // Simplified
          totalMovies,
          totalSeries,
          dailyViews: viewStats.dailyViews,
          weeklyViews: viewStats.weeklyViews,
          activeSubscriptionsCount: 0, // Simplified
          activeSessions: 0, // Simplified
          revenue: {
            monthly: 0, // Simplified
            growth: 0, // Simplified
            totalPayments: 0 // Simplified
          },
          subscriptions: {
            basic: 0, // Simplified
            standard: 0, // Simplified
            premium: 0 // Simplified
          },
          recentActivity: {
            newMoviesAdded: 0, // Simplified
            newUsersToday: 0 // Simplified
          }
        };
        
        res.write(`data: ${JSON.stringify(analyticsData)}\n\n`);
      }).catch(error => {
        console.error("Error in analytics stream:", error);
        res.write(`data: {"error": "Failed to fetch initial data"}\n\n`);
      });
      
      // Send updates every 30 seconds (simplified)
      const interval = setInterval(async () => {
        try {
          const allUsers = await storage.getAllUsers();
          const totalUsers = allUsers.length;
          const activeUsers = allUsers.filter(user => !user.banned).length;
          
          const allContent = await storage.getAllContent();
          const totalMovies = allContent.filter(c => c.mediaType === 'movie').length;
          const totalSeries = allContent.filter(c => c.mediaType === 'tv').length;
          
          const viewStats = await storage.getViewStats();
          
          const analyticsData = {
            totalUsers,
            activeUsers,
            newUsersThisWeek: 0, // Simplified
            totalMovies,
            totalSeries,
            dailyViews: viewStats.dailyViews,
            weeklyViews: viewStats.weeklyViews,
            activeSubscriptionsCount: 0, // Simplified
            activeSessions: 0, // Simplified
            revenue: {
              monthly: 0, // Simplified
              growth: 0, // Simplified
              totalPayments: 0 // Simplified
            },
            subscriptions: {
              basic: 0, // Simplified
              standard: 0, // Simplified
              premium: 0 // Simplified
            },
            recentActivity: {
              newMoviesAdded: 0, // Simplified
              newUsersToday: 0 // Simplified
            }
          };
          
          res.write(`data: ${JSON.stringify(analyticsData)}\n\n`);
        } catch (error) {
          console.error("Error in analytics stream update:", error);
        }
      }, 30000);
      
      // Clean up on client disconnect
      req.on('close', () => {
        clearInterval(interval);
      });
    } catch (error) {
      console.error("Error in analytics stream:", error);
      res.status(500).json({ error: "Failed to establish analytics stream" });
    }
  });

  // TMDB API endpoints
  app.get("/api/tmdb/popular", async (req: any, res: any) => {
    try {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        console.error("TMDB_API_KEY is not configured in environment variables");
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=fr-FR&page=1`
      );
      
      if (!response.ok) {
        console.error(`TMDB API error: ${response.status} ${response.statusText}`);
        // Handle rate limiting specifically
        if (response.status === 429) {
          return res.status(429).json({ 
            error: "Rate limit exceeded. Please try again later.",
            status: 429 
          });
        }
        return res.status(response.status).json({ 
          error: `TMDB API error: ${response.statusText}`,
          status: response.status 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching popular movies:", error);
      res.status(500).json({ error: "Failed to fetch popular movies", details: error.message || 'Unknown error' });
    }
  });

  app.get("/api/tmdb/genre/:genreId", async (req: any, res: any) => {
    try {
      const { genreId } = req.params;
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        console.error("TMDB_API_KEY is not configured in environment variables");
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=fr-FR&with_genres=${genreId}&page=1`
      );
      
      if (!response.ok) {
        console.error(`TMDB API error: ${response.status} ${response.statusText}`);
        // Handle rate limiting specifically
        if (response.status === 429) {
          return res.status(429).json({ 
            error: "Rate limit exceeded. Please try again later.",
            status: 429 
          });
        }
        return res.status(response.status).json({ 
          error: `TMDB API error: ${response.statusText}`,
          status: response.status 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching movies by genre:", error);
      res.status(500).json({ error: "Failed to fetch movies by genre", details: error.message || 'Unknown error' });
    }
  });

  app.get("/api/tmdb/movie/:id", async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const [movieResponse, creditsResponse, videosResponse] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=fr-FR`),
        fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}`),
        fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}&language=fr-FR`)
      ]);

      if (!movieResponse.ok || !creditsResponse.ok || !videosResponse.ok) {
        throw new Error("TMDB API error");
      }

      const [movie, credits, videos] = await Promise.all([
        movieResponse.json(),
        creditsResponse.json(),
        videosResponse.json()
      ]);

      res.json({ movie, credits, videos });
    } catch (error) {
      console.error("Error fetching movie details:", error);
      res.status(500).json({ error: "Failed to fetch movie details" });
    }
  });

  app.get("/api/tmdb/search", async (req: any, res: any) => {
    try {
      const { query } = req.query;
      const apiKey = process.env.TMDB_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=fr-FR&query=${encodeURIComponent(query as string)}&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({ error: "Failed to search movies" });
    }
  });

  // Multi-search endpoint for both movies and TV shows
  app.get("/api/tmdb/multi-search", async (req: any, res: any) => {
    try {
      const { query } = req.query;
      const apiKey = process.env.TMDB_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=fr-FR&query=${encodeURIComponent(query as string)}&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching multi content:", error);
      res.status(500).json({ error: "Failed to search content" });
    }
  });

  // TV Series endpoints
  app.get("/api/tmdb/tv/popular", async (req: any, res: any) => {
    try {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=fr-FR&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching popular TV shows:", error);
      res.status(500).json({ error: "Failed to fetch popular TV shows" });
    }
  });

  app.get("/api/tmdb/tv/top_rated", async (req: any, res: any) => {
    try {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=fr-FR&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching top rated TV shows:", error);
      res.status(500).json({ error: "Failed to fetch top rated TV shows" });
    }
  });

  app.get("/api/tmdb/tv/on_the_air", async (req, res) => {
    try {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/tv/on_the_air?api_key=${apiKey}&language=fr-FR&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching on the air TV shows:", error);
      res.status(500).json({ error: "Failed to fetch on the air TV shows" });
    }
  });

  app.get("/api/tmdb/tv/airing_today", async (req, res) => {
    try {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/tv/airing_today?api_key=${apiKey}&language=fr-FR&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching airing today TV shows:", error);
      res.status(500).json({ error: "Failed to fetch airing today TV shows" });
    }
  });

  app.get("/api/tmdb/tv/genre/:genreId", async (req, res) => {
    try {
      const { genreId } = req.params;
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=fr-FR&with_genres=${genreId}&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching TV shows by genre:", error);
      res.status(500).json({ error: "Failed to fetch TV shows by genre" });
    }
  });

  app.get("/api/tmdb/tv/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=fr-FR&append_to_response=credits,videos`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching TV show details:", error);
      res.status(500).json({ error: "Failed to fetch TV show details" });
    }
  });

  app.get("/api/tmdb/tv/search", async (req, res) => {
    try {
      const { query } = req.query;
      const apiKey = process.env.TMDB_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=fr-FR&query=${encodeURIComponent(query as string)}&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching TV shows:", error);
      res.status(500).json({ error: "Failed to search TV shows" });
    }
  });

  // Lygos Payment Routes
  
  // Create payment invoice for subscription
  app.post("/api/subscription/create-payment", authenticateToken, async (req: any, res: any) => {
    try {
      const { planId, customerInfo } = req.body;
      
      console.log('Received payment request:', { planId, customerInfo });
      
      if (!planId || !customerInfo) {
        return res.status(400).json({ error: "Plan ID and customer info are required" });
      }
      
      // Validate customer info
      if (!customerInfo.name || !customerInfo.email) {
        return res.status(400).json({ error: "Customer name and email are required" });
      }
      
      // Use our payment service to create the payment
      const selectedPlan = plans[planId as keyof typeof plans];
      
      // For paid plans, use the payment service
      const userId = req.user?.userId || `temp_${customerInfo.email}_${Date.now()}`;
      console.log('Creating payment for:', { userId, planId, customerInfo });
      
      const paymentResponse = await paymentService.createLygosPayment(planId, customerInfo, userId);
      
      // For paid plans, return the payment details
      console.log('Payment created successfully:', paymentResponse);
      res.json(paymentResponse);
    } catch (error: any) {
      console.error("Error creating payment:", error);
      
      // Send a more user-friendly error message
      const errorMessage = error.message || 'Erreur inconnue lors de la création du paiement';
      const errorDetails = process.env.NODE_ENV === 'development' ? error.stack : undefined;
      
      res.status(500).json({ 
        error: "Failed to create payment", 
        details: errorMessage,
        ...(errorDetails ? { stack: errorDetails } : {})
      });
    }
  });
  
  // Lygos webhook endpoint for automatic subscription activation
  app.post("/api/webhook/lygos", async (req: any, res: any) => {
    try {
      console.log("Lygos webhook received:", req.body);
      
      // Use our payment service to process the webhook
      const result = await paymentService.processLygosWebhook(req.body);
      
      // Process the payment based on status
      const paymentData = req.body;
      const { id, status, custom_data } = paymentData;
      
      // Process the payment based on status
      if (status === "completed") {
        // Activate subscription in your database
        if (custom_data && custom_data.userId && custom_data.planId) {
          const { userId, planId, customerInfo } = custom_data;
          
          // Get plan information
          const selectedPlan = plans[planId as keyof typeof plans];
          if (selectedPlan) {
            // Calculate end date
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + selectedPlan.duration);
            
            // Create subscription
            const newSubscription = await storage.createSubscription({
              userId: userId,
              planId: planId,
              amount: selectedPlan.amount,
              paymentMethod: 'lygos',
              status: 'active',
              startDate: new Date(),
              endDate: endDate
            });
            
            // Create payment record
            await storage.createPayment({
              userId: userId,
              amount: selectedPlan.amount,
              method: 'lygos',
              status: 'success',
              transactionId: id,
              paymentData: { planId, customerInfo }
            });
            
            console.log("Subscription activated for user:", userId);
          }
        }
        console.log("Lygos payment completed for payment ID:", id);
      } else if (status === "failed" || status === "cancelled") {
        // Handle failed payment
        if (custom_data && custom_data.userId) {
          // Log the failed payment
          await storage.createPayment({
            userId: custom_data.userId,
            amount: custom_data.planId ? plans[custom_data.planId as keyof typeof plans]?.amount || 0 : 0,
            method: 'lygos',
            status: 'failed',
            transactionId: id,
            paymentData: custom_data
          });
        }
        console.log("Lygos payment failed or cancelled for payment ID:", id);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error processing Lygos webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });
  
  // Create free subscription - completely separate from Lygos
  app.post("/api/subscription/create-free", authenticateToken, async (req: any, res: any) => {
    try {
      const { planId, customerInfo } = req.body;
      
      // Validate input
      if (!planId || !customerInfo) {
        return res.status(400).json({ error: "Plan ID and customer info are required" });
      }
      
      // Validate plan
      if (!plans[planId as keyof typeof plans]) {
        return res.status(400).json({ error: "Invalid plan" });
      }

      // Ensure user is authenticated
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: "User must be authenticated" });
      }

      const userId = req.user.userId;
      
      // Get plan information
      const selectedPlan = plans[planId as keyof typeof plans];
      
      // Only allow free plans (amount = 0)
      if (selectedPlan.amount !== 0) {
        return res.status(400).json({ error: "This endpoint is only for free plans" });
      }
      
      // Check if user already has an active subscription
      const existingSubscription = await storage.getUserSubscription(userId);
      if (existingSubscription && existingSubscription.status === 'active') {
        return res.status(400).json({ error: "User already has an active subscription" });
      }
      
      // Cancel existing subscription if any
      if (existingSubscription) {
        await storage.updateSubscription(existingSubscription.id, { status: 'cancelled' });
      }

      // Create new subscription with fixed dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + selectedPlan.duration);

      const newSubscription = await storage.createSubscription({
        userId: userId,
        planId: planId,
        amount: selectedPlan.amount,
        paymentMethod: 'free',
        status: 'active',
        startDate: startDate,
        endDate: endDate
      });

      // Create payment record for tracking
      await storage.createPayment({
        userId: userId,
        amount: selectedPlan.amount,
        method: 'free',
        status: 'success',
        transactionId: `free_${Date.now()}`,
        paymentData: { planId, customerInfo }
      });

      res.json({
        success: true,
        subscription: newSubscription,
        message: 'Free subscription activated successfully'
      });
    } catch (error: any) {
      console.error("Error processing free subscription:", error);
      res.status(500).json({ error: "Failed to process subscription", details: error.message });
    }
  });

  // Get user's current subscription
  app.get("/api/subscription/current", authenticateToken, async (req: any, res: any) => {
    try {
      if (!req.user) {
        return res.json({ subscription: null, message: "No active subscription - user not authenticated" });
      }
      
      const subscription = await storage.getUserSubscription(req.user.userId);
      
      if (!subscription) {
        return res.json({ subscription: null, message: "No active subscription" });
      }
      
      res.json({ subscription });
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });
  
  // Get user's payment history
  app.get("/api/subscription/payment-history", authenticateToken, async (req: any, res: any) => {
    try {
      if (!req.user) {
        return res.json({ payments: [], message: "No payment history - user not authenticated" });
      }
      
      const payments = await storage.getUserPayments(req.user.userId);
      
      res.json({ payments });
    } catch (error) {
      console.error("Error fetching payment history:", error);
      res.status(500).json({ error: "Failed to fetch payment history" });
    }
  });

  // Get subscription plans
  app.get("/api/subscription/plans", async (req: any, res: any) => {
    try {
      res.json(plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ error: "Failed to fetch plans" });
    }
  });
  
  // Check payment status
  app.get("/api/subscription/check-payment/:paymentId", async (req: any, res: any) => {
    try {
      const { paymentId } = req.params;
      
      // Use our payment service to check the payment status
      const paymentStatus = await paymentService.checkLygosPaymentStatus(paymentId);
      res.json(paymentStatus);
    } catch (error: any) {
      console.error("Error checking payment status:", error);
      
      // Send a more user-friendly error message
      const errorMessage = error.message || 'Erreur inconnue lors de la vérification du paiement';
      const errorDetails = process.env.NODE_ENV === 'development' ? error.stack : undefined;
      
      res.status(500).json({ 
        error: "Impossible de vérifier le statut du paiement", 
        details: errorMessage,
        ...(errorDetails ? { stack: errorDetails } : {})
      });
    }
  });
  
  // Test payment service configuration
  app.get("/api/test/payment-service", async (req: any, res: any) => {
    try {
      // Check if payment service is configured
      const isLygosConfigured = paymentService.isConfigured();
      
      res.json({
        status: 'Payment Service Configuration',
        serviceInfo: {
          currentService: 'lygos',
          lygosAvailable: isLygosConfigured,
          usingPaymentLink: isLygosConfigured
        },
        ready: isLygosConfigured
      });
    } catch (error) {
      console.error('Payment service test error:', error);
      res.status(500).json({ error: 'Configuration test failed' });
    }
  });

  // Get CSRF token
  app.get("/api/csrf-token", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Non authentifié" });
    }
    
    const token = generateCSRFToken(req.user.userId, req.headers['user-agent'] || '', req.ip || req.connection.remoteAddress || 'unknown');
    res.json({ csrfToken: token });
  });

  // Get security logs (admin only)
  app.get("/api/admin/security-logs", requireAdmin, (req, res) => {
    try {
      const logs = securityLogger.getRecentEvents(100);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching security logs:", error);
      // Provide more detailed error information
      res.status(500).json({ 
        error: "Failed to fetch security logs",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Test video link accessibility
  app.post("/api/admin/test-video-link", requireAdmin, async (req: any, res: any) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      
      // Validate URL format
      try {
        new URL(url);
      } catch (urlError) {
        return res.status(400).json({ error: "Invalid URL format" });
      }
      
      // Test the URL accessibility
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        res.json({
          success: true,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // Check if it's a CORS error
        if (fetchError.name === 'AbortError') {
          return res.status(408).json({ 
            error: "Request timeout - the server took too long to respond",
            possible_cause: "Network issue or server not responding"
          });
        }
        
        // Generic error
        res.status(500).json({ 
          error: "Failed to test video link",
          details: fetchError.message,
          possible_cause: "CORS restriction, network issue, or invalid URL"
        });
      }
    } catch (error) {
      console.error("Error testing video link:", error);
      res.status(500).json({ error: "Failed to test video link" });
    }
  });

  // Admin routes for episode management
  app.post("/api/admin/episodes", requireAdmin, async (req: any, res: any) => {
    try {
      const { contentId, seasonNumber, episodeNumber, title, description, odyseeUrl, releaseDate } = req.body;
      
      // Validate required fields
      if (!contentId || !seasonNumber || !episodeNumber || !title) {
        return res.status(400).json({ error: "Les champs contentId, seasonNumber, episodeNumber et title sont requis" });
      }
      
      // Check if content exists and is a TV series
      const existingContent = await storage.getContentById(contentId);
      if (!existingContent) {
        return res.status(404).json({ error: "Contenu non trouvé" });
      }
      
      if (existingContent.mediaType !== 'tv') {
        return res.status(400).json({ error: "Le contenu doit être une série TV" });
      }
      
      // Check if episode already exists
      const existingEpisodes = await storage.getEpisodesByContentId(contentId);
      const episodeExists = existingEpisodes.some(
        ep => ep.seasonNumber === seasonNumber && ep.episodeNumber === episodeNumber
      );
      
      if (episodeExists) {
        return res.status(400).json({ error: "Cet épisode existe déjà pour cette saison" });
      }
      
      // Create episode
      const episodeData = {
        contentId,
        seasonNumber,
        episodeNumber,
        title,
        description: description || '',
        odyseeUrl: odyseeUrl || '',
        releaseDate: releaseDate || '',
        active: true
      };
      
      const newEpisode = await storage.createEpisode(episodeData);
      
      res.status(201).json({ 
        success: true, 
        message: "Épisode créé avec succès",
        episode: newEpisode
      });
    } catch (error) {
      console.error("Error creating episode:", error);
      res.status(500).json({ error: "Erreur lors de la création de l'épisode" });
    }
  });

  app.get("/api/admin/episodes/:contentId", requireAdmin, async (req: any, res: any) => {
    try {
      const { contentId } = req.params;
      
      // Validate input
      if (!contentId) {
        return res.status(400).json({ error: "contentId est requis" });
      }
      
      // Check if content exists
      const existingContent = await storage.getContentById(contentId);
      if (!existingContent) {
        return res.status(404).json({ error: "Contenu non trouvé" });
      }
      
      // Get all episodes for this content
      const episodes = await storage.getEpisodesByContentId(contentId);
      
      res.json({ episodes });
    } catch (error) {
      console.error("Error fetching episodes:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des épisodes" });
    }
  });

  app.put("/api/admin/episodes/:episodeId", requireAdmin, async (req: any, res: any) => {
    try {
      const { episodeId } = req.params;
      const updateData = req.body;
      
      // Validate input
      if (!episodeId) {
        return res.status(400).json({ error: "episodeId est requis" });
      }
      
      // Check if episode exists
      const existingEpisode = await storage.getEpisodeById(episodeId);
      if (!existingEpisode) {
        return res.status(404).json({ error: "Épisode non trouvé" });
      }
      
      // Update episode
      const updatedEpisode = await storage.updateEpisode(episodeId, updateData);
      
      res.json({ 
        success: true, 
        message: "Épisode mis à jour avec succès",
        episode: updatedEpisode
      });
    } catch (error) {
      console.error("Error updating episode:", error);
      res.status(500).json({ error: "Erreur lors de la mise à jour de l'épisode" });
    }
  });

  app.delete("/api/admin/episodes/:episodeId", requireAdmin, async (req: any, res: any) => {
    try {
      const { episodeId } = req.params;
      
      // Validate input
      if (!episodeId) {
        return res.status(400).json({ error: "episodeId est requis" });
      }
      
      // Check if episode exists
      const existingEpisode = await storage.getEpisodeById(episodeId);
      if (!existingEpisode) {
        return res.status(404).json({ error: "Épisode non trouvé" });
      }
      
      // Delete episode
      await storage.deleteEpisode(episodeId);
      
      res.json({ 
        success: true, 
        message: "Épisode supprimé avec succès"
      });
    } catch (error) {
      console.error("Error deleting episode:", error);
      res.status(500).json({ error: "Erreur lors de la suppression de l'épisode" });
    }
  });

  // Test video link accessibility
  app.get("/api/test-video-link", async (req: any, res: any) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "URL is required" });
      }
      
      // Validate URL format
      try {
        new URL(url);
      } catch (urlError) {
        return res.status(400).json({ error: "Invalid URL format" });
      }
      
      // Test if URL is accessible
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'StreamFlix-Video-Tester/1.0'
          }
        });
        
        clearTimeout(timeoutId);
        
        res.json({
          url,
          accessible: response.ok,
          statusCode: response.status,
          contentType: response.headers.get('content-type') || 'unknown',
          contentLength: response.headers.get('content-length') || 'unknown'
        });
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        res.json({
          url,
          accessible: false,
          error: error.message
        });
      }
    } catch (error) {
      console.error("Error testing video link:", error);
      res.status(500).json({ error: "Failed to test video link" });
    }
  });

  // TMDB API endpoints
  app.get("/api/tmdb/trending", async (req: any, res: any) => {
    try {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        console.error("TMDB_API_KEY is not configured in environment variables");
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=fr-FR`
      );
      
      if (!response.ok) {
        console.error(`TMDB API error: ${response.status} ${response.statusText}`);
        // Handle rate limiting specifically
        if (response.status === 429) {
          return res.status(429).json({ 
            error: "Rate limit exceeded. Please try again later.",
            status: 429 
          });
        }
        return res.status(response.status).json({ 
          error: `TMDB API error: ${response.statusText}`,
          status: response.status 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching trending movies:", error);
      res.status(500).json({ error: "Failed to fetch trending movies", details: error.message || 'Unknown error' });
    }
  });

  app.get("/api/tmdb/popular", async (req: any, res: any) => {
    try {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        console.error("TMDB_API_KEY is not configured in environment variables");
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=fr-FR&page=1`
      );
      
      if (!response.ok) {
        console.error(`TMDB API error: ${response.status} ${response.statusText}`);
        // Handle rate limiting specifically
        if (response.status === 429) {
          return res.status(429).json({ 
            error: "Rate limit exceeded. Please try again later.",
            status: 429 
          });
        }
        return res.status(response.status).json({ 
          error: `TMDB API error: ${response.statusText}`,
          status: response.status 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching popular movies:", error);
      res.status(500).json({ error: "Failed to fetch popular movies", details: error.message || 'Unknown error' });
    }
  });

  app.get("/api/tmdb/genre/:genreId", async (req: any, res: any) => {
    try {
      const { genreId } = req.params;
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        console.error("TMDB_API_KEY is not configured in environment variables");
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=fr-FR&with_genres=${genreId}&page=1`
      );
      
      if (!response.ok) {
        console.error(`TMDB API error: ${response.status} ${response.statusText}`);
        // Handle rate limiting specifically
        if (response.status === 429) {
          return res.status(429).json({ 
            error: "Rate limit exceeded. Please try again later.",
            status: 429 
          });
        }
        return res.status(response.status).json({ 
          error: `TMDB API error: ${response.statusText}`,
          status: response.status 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching movies by genre:", error);
      res.status(500).json({ error: "Failed to fetch movies by genre", details: error.message || 'Unknown error' });
    }
  });

  app.get("/api/tmdb/movie/:id", async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const [movieResponse, creditsResponse, videosResponse] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=fr-FR`),
        fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}`),
        fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}&language=fr-FR`)
      ]);

      if (!movieResponse.ok || !creditsResponse.ok || !videosResponse.ok) {
        throw new Error("TMDB API error");
      }

      const [movie, credits, videos] = await Promise.all([
        movieResponse.json(),
        creditsResponse.json(),
        videosResponse.json()
      ]);

      res.json({ movie, credits, videos });
    } catch (error) {
      console.error("Error fetching movie details:", error);
      res.status(500).json({ error: "Failed to fetch movie details" });
    }
  });

  app.get("/api/tmdb/search", async (req: any, res: any) => {
    try {
      const { query } = req.query;
      const apiKey = process.env.TMDB_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=fr-FR&query=${encodeURIComponent(query as string)}&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({ error: "Failed to search movies" });
    }
  });

  // Multi-search endpoint for both movies and TV shows
  app.get("/api/tmdb/multi-search", async (req: any, res: any) => {
    try {
      const { query } = req.query;
      const apiKey = process.env.TMDB_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=fr-FR&query=${encodeURIComponent(query as string)}&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching multi content:", error);
      res.status(500).json({ error: "Failed to search content" });
    }
  });

  // TV Series endpoints
  app.get("/api/tmdb/tv/popular", async (req: any, res: any) => {
    try {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=fr-FR&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching popular TV shows:", error);
      res.status(500).json({ error: "Failed to fetch popular TV shows" });
    }
  });

  app.get("/api/tmdb/tv/top_rated", async (req: any, res: any) => {
    try {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=fr-FR&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching top rated TV shows:", error);
      res.status(500).json({ error: "Failed to fetch top rated TV shows" });
    }
  });

  app.get("/api/tmdb/tv/on_the_air", async (req, res) => {
    try {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/tv/on_the_air?api_key=${apiKey}&language=fr-FR&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching on the air TV shows:", error);
      res.status(500).json({ error: "Failed to fetch on the air TV shows" });
    }
  });

  app.get("/api/tmdb/tv/airing_today", async (req, res) => {
    try {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/tv/airing_today?api_key=${apiKey}&language=fr-FR&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching airing today TV shows:", error);
      res.status(500).json({ error: "Failed to fetch airing today TV shows" });
    }
  });

  app.get("/api/tmdb/tv/genre/:genreId", async (req, res) => {
    try {
      const { genreId } = req.params;
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=fr-FR&with_genres=${genreId}&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching TV shows by genre:", error);
      res.status(500).json({ error: "Failed to fetch TV shows by genre" });
    }
  });

  app.get("/api/tmdb/tv/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=fr-FR&append_to_response=credits,videos`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching TV show details:", error);
      res.status(500).json({ error: "Failed to fetch TV show details" });
    }
  });

  app.get("/api/tmdb/tv/search", async (req, res) => {
    try {
      const { query } = req.query;
      const apiKey = process.env.TMDB_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "TMDB API key not configured" });
      }

      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=fr-FR&query=${encodeURIComponent(query as string)}&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching TV shows:", error);
      res.status(500).json({ error: "Failed to search TV shows" });
    }
  });
  
  return server;
}


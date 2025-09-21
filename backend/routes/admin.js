import express from "express";
const router = express.Router();

// In-memory storage for various data (in a real app, this would be a database)
let content = [];
let users = [
  { id: "1", username: "admin", email: "admin@example.com", role: "admin", createdAt: new Date().toISOString() },
  { id: "2", username: "user1", email: "user1@example.com", role: "user", createdAt: new Date().toISOString() },
  { id: "3", username: "user2", email: "user2@example.com", role: "user", createdAt: new Date().toISOString() }
];
let favorites = [];
let contactMessages = [];
let subscriptions = [];
let payments = [];
let banners = [
  { 
    id: "1", 
    title: "Offre spéciale - 50% de réduction !", 
    description: "Profitez de 50% de réduction sur tous les plans d'abonnement ce mois-ci !", 
    priority: 1, 
    imageUrl: "", 
    active: true 
  }
];
let collections = [];
let securityLogs = [
  { 
    timestamp: new Date().toISOString(), 
    eventType: "ADMIN_ACCESS", 
    userId: "1", 
    ipAddress: "192.168.1.1", 
    details: "Admin user logged in", 
    severity: "INFO" 
  }
];

// Content management endpoints
router.get("/admin/content", (req, res) => {
  try {
    res.json(content);
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

// Add endpoint to fetch content by TMDB ID
router.get("/contents/tmdb/:tmdbId", (req, res) => {
  try {
    const { tmdbId } = req.params;
    const contentItem = content.find(c => c.tmdbId == tmdbId);
    
    if (!contentItem) {
      // Return a default content object with empty video URL instead of 404
      return res.json({
        id: `tmdb-${tmdbId}`,
        tmdbId: parseInt(tmdbId),
        odyseeUrl: "",
        active: false,
        createdAt: new Date().toISOString()
      });
    }
    
    // Check if content has a video URL
    if (!contentItem.odyseeUrl) {
      // Return content with empty URL instead of 404
      return res.json({
        ...contentItem,
        odyseeUrl: ""
      });
    }
    
    res.json(contentItem);
  } catch (error) {
    console.error("Error fetching content by TMDB ID:", error);
    // Return a default content object with empty video URL instead of error
    const { tmdbId } = req.params;
    res.json({
      id: `tmdb-${tmdbId}`,
      tmdbId: parseInt(tmdbId),
      odyseeUrl: "",
      active: false,
      createdAt: new Date().toISOString()
    });
  }
});

router.post("/admin/content", (req, res) => {
  try {
    const newContent = {
      id: `${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    content.push(newContent);
    res.status(201).json(newContent);
  } catch (error) {
    console.error("Error creating content:", error);
    res.status(500).json({ error: "Failed to create content" });
  }
});

// User management endpoints
router.get("/admin/users", (req, res) => {
  try {
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.put("/admin/users/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }
    
    users[userIndex] = { ...users[userIndex], ...updates };
    res.json(users[userIndex]);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.post("/admin/users/:userId/suspend", (req, res) => {
  try {
    const { userId } = req.params;
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }
    
    users[userIndex].suspended = true;
    res.json({ message: "User suspended successfully" });
  } catch (error) {
    console.error("Error suspending user:", error);
    res.status(500).json({ error: "Failed to suspend user" });
  }
});

// Add delete user endpoint
router.delete("/admin/users/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Remove user from the array
    users.splice(userIndex, 1);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Favorites management endpoints
router.get("/admin/favorites", (req, res) => {
  try {
    res.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// Contact messages endpoints
router.get("/contact-messages", (req, res) => {
  try {
    res.json(contactMessages);
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({ error: "Failed to fetch contact messages" });
  }
});

router.delete("/contact-messages/:messageId", (req, res) => {
  try {
    const { messageId } = req.params;
    contactMessages = contactMessages.filter(m => m.id !== messageId);
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    res.status(500).json({ error: "Failed to delete contact message" });
  }
});

// Subscriptions management endpoints
router.get("/admin/subscriptions", (req, res) => {
  try {
    res.json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

// Payments history endpoints
router.get("/admin/payments", (req, res) => {
  try {
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// Analytics data endpoints
router.get("/admin/analytics", (req, res) => {
  try {
    // Mock analytics data
    const analytics = {
      totalUsers: users.length,
      activeUsers: users.filter(u => !u.suspended).length,
      newUsersThisWeek: 2,
      totalMovies: content.filter(c => c.mediaType === 'movie').length,
      totalSeries: content.filter(c => c.mediaType === 'tv').length,
      dailyViews: 124,
      weeklyViews: 842,
      activeSubscriptionsCount: subscriptions.filter(s => s.status === 'active').length,
      activeSessions: 12,
      revenue: {
        monthly: 2450,
        growth: 12.5,
        totalPayments: 42
      },
      subscriptions: {
        basic: 15,
        standard: 28,
        premium: 12
      },
      recentActivity: {
        newMoviesAdded: 3,
        newUsersToday: 1
      }
    };
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Banners management endpoints
router.get("/admin/banners", (req, res) => {
  try {
    res.json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
});

router.put("/admin/banners/:bannerId", (req, res) => {
  try {
    const { bannerId } = req.params;
    const updates = req.body;
    
    const bannerIndex = banners.findIndex(b => b.id === bannerId);
    if (bannerIndex === -1) {
      return res.status(404).json({ error: "Banner not found" });
    }
    
    banners[bannerIndex] = { ...banners[bannerIndex], ...updates };
    res.json(banners[bannerIndex]);
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ error: "Failed to update banner" });
  }
});

// Collections management endpoints
router.get("/admin/collections", (req, res) => {
  try {
    res.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
});

// Security logs endpoints
router.get("/admin/security-logs", (req, res) => {
  try {
    res.json(securityLogs);
  } catch (error) {
    console.error("Error fetching security logs:", error);
    res.status(500).json({ error: "Failed to fetch security logs" });
  }
});

// Episodes management (in-memory)
let episodes = [];

// Get episodes for a content ID
router.get("/admin/episodes/:contentId", (req, res) => {
  try {
    const { contentId } = req.params;
    const list = episodes.filter((e) => e.contentId === contentId);
    res.json({ episodes: list });
  } catch (error) {
    console.error("Error fetching episodes:", error);
    res.status(500).json({ error: "Failed to fetch episodes" });
  }
});

// Create a new episode
router.post("/admin/episodes", (req, res) => {
  try {
    const {
      contentId,
      seasonNumber,
      episodeNumber,
      title,
      description = "",
      odyseeUrl = "",
      releaseDate = null,
      active = true,
    } = req.body || {};

    if (!contentId || seasonNumber == null || episodeNumber == null || !title) {
      return res.status(400).json({
        error: "contentId, seasonNumber, episodeNumber and title are required",
      });
    }

    const now = new Date().toISOString();
    const newEpisode = {
      id: `${Date.now()}`,
      contentId,
      seasonNumber: Number(seasonNumber),
      episodeNumber: Number(episodeNumber),
      title,
      description,
      odyseeUrl,
      releaseDate,
      active: Boolean(active),
      createdAt: now,
      updatedAt: now,
    };

    episodes.push(newEpisode);
    res.status(201).json(newEpisode);
  } catch (error) {
    console.error("Error creating episode:", error);
    res.status(500).json({ error: "Failed to create episode" });
  }
});

// Update an episode
router.put("/admin/episodes/:episodeId", (req, res) => {
  try {
    const { episodeId } = req.params;
    const idx = episodes.findIndex((e) => e.id === episodeId);
    if (idx === -1) return res.status(404).json({ error: "Episode not found" });

    episodes[idx] = { ...episodes[idx], ...req.body, updatedAt: new Date().toISOString() };
    res.json(episodes[idx]);
  } catch (error) {
    console.error("Error updating episode:", error);
    res.status(500).json({ error: "Failed to update episode" });
  }
});

// Delete an episode
router.delete("/admin/episodes/:episodeId", (req, res) => {
  try {
    const { episodeId } = req.params;
    const before = episodes.length;
    episodes = episodes.filter((e) => e.id !== episodeId);
    if (episodes.length === before) return res.status(404).json({ error: "Episode not found" });

    res.json({ message: "Episode deleted successfully" });
  } catch (error) {
    console.error("Error deleting episode:", error);
    res.status(500).json({ error: "Failed to delete episode" });
  }
});

export default router;
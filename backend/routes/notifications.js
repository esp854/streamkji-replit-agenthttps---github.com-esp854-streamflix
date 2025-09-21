import express from "express";
const router = express.Router();

// In-memory storage for notifications (in a real app, this would be a database)
let notifications = [];

// Get all admin notifications
router.get("/notifications", (req, res) => {
  try {
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Send a notification to a specific user
router.post("/notifications/send", (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({ error: "Missing required fields: userId, title, message" });
    }
    
    const notification = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      title,
      message,
      type: type || "info",
      createdAt: new Date().toISOString(),
      read: false
    };
    
    notifications.push(notification);
    
    // In a real app, you would send this notification to the user via WebSocket, email, etc.
    console.log("Notification sent to user:", userId, notification);
    
    res.status(201).json({ 
      success: true, 
      message: "Notification sent successfully",
      notification 
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// Send announcement to all users
router.post("/send-announcement", (req, res) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ error: "Missing required fields: subject, message" });
    }
    
    const announcement = {
      id: `announcement-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: subject,
      message,
      type: "announcement",
      createdAt: new Date().toISOString(),
      isAnnouncement: true
    };
    
    notifications.push(announcement);
    
    // In a real app, you would broadcast this to all users
    console.log("Announcement sent to all users:", announcement);
    
    res.status(201).json({ 
      success: true, 
      message: "Announcement sent to all users successfully",
      announcement 
    });
  } catch (error) {
    console.error("Error sending announcement:", error);
    res.status(500).json({ error: "Failed to send announcement" });
  }
});

// Mark notification as read
router.put("/notifications/:id/read", (req, res) => {
  try {
    const { id } = req.params;
    const notification = notifications.find(n => n.id === id);
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    notification.read = true;
    res.json({ success: true, notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Delete a notification
router.delete("/notifications/:id", (req, res) => {
  try {
    const { id } = req.params;
    const notificationIndex = notifications.findIndex(n => n.id === id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    notifications.splice(notificationIndex, 1);
    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

export default router;
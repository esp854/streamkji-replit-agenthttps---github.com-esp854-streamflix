import express from "express";
const router = express.Router();

// Mock user data (in a real app, this would come from a database)
const users = [
  { 
    id: "1", 
    username: "admin", 
    email: "admin@example.com", 
    role: "admin",
    subscription: {
      planId: "premium",
      status: "active",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
    },
    createdAt: new Date().toISOString()
  },
  { 
    id: "2", 
    username: "user1", 
    email: "user1@example.com", 
    role: "user",
    subscription: {
      planId: "basic",
      status: "active",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    },
    createdAt: new Date().toISOString()
  }
];

// Login route
router.post("/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    // In a real app, you would verify the password against a hashed version in the database
    // For now, we'll mock authentication by checking if the user exists
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Mock token generation (in a real app, you would use a proper JWT library)
    const token = `mock-jwt-token-for-${user.id}`;
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Get current user info
router.get("/auth/me", (req, res) => {
  try {
    // In a real app, you would verify the auth token and fetch user from database
    // For now, we'll return the first user as a mock
    const user = users[0];
    res.json(user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
});

// Get current user subscription
router.get("/subscription/current", (req, res) => {
  try {
    // In a real app, you would verify the auth token and fetch user's subscription from database
    // For now, we'll return the first user's subscription as a mock
    const subscription = users[0].subscription;
    res.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

// Create free subscription
router.post("/subscription/create-free", (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    // Create a free subscription
    const freeSubscription = {
      planId: "free",
      status: "active",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
    };
    
    // In a real app, you would save this to the database
    console.log(`Created free subscription for user ${userId}`);
    
    res.status(201).json({
      success: true,
      message: "Free subscription created successfully",
      subscription: freeSubscription
    });
  } catch (error) {
    console.error("Error creating free subscription:", error);
    res.status(500).json({ error: "Failed to create free subscription" });
  }
});

// Check payment status
router.get("/payment/check-payment/:paymentId", (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // In a real app, you would check the actual payment status from the payment provider
    // For now, we'll mock a successful payment
    const paymentStatus = {
      id: paymentId,
      status: "completed",
      amount: 2000,
      currency: "XOF",
      createdAt: new Date().toISOString()
    };
    
    res.json(paymentStatus);
  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({ error: "Failed to check payment status" });
  }
});

// Register route
router.post("/auth/register", (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    
    // Create new user
    const newUser = {
      id: `${users.length + 1}`,
      username,
      email,
      role: "user",
      subscription: {
        planId: "free",
        status: "active",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      },
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // Mock token generation (in a real app, you would use a proper JWT library)
    const token = `mock-jwt-token-for-${newUser.id}`;
    
    res.status(201).json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        subscription: newUser.subscription,
        createdAt: newUser.createdAt
      },
      token
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Failed to register" });
  }
});

// Logout route
router.post("/auth/logout", (req, res) => {
  try {
    // In a real app, you would invalidate the token
    // For now, we'll just send a success response
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
});

export default router;
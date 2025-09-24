import express from "express";
const router = express.Router();

// Mock banners data (in a real app, this would come from a database)
let banners = [
  {
    id: "1",
    title: "Débloquez le streaming premium",
    description: "Accédez à des milliers de films et séries en HD/4K. Paiement sécurisé avec Djamo - Orange Money, Wave, et cartes bancaires acceptées.",
    type: "subscription",
    price: "2.000",
    priority: 1,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    title: "Offre spéciale - 50% de réduction !",
    description: "Profitez de 50% de réduction sur tous les plans d'abonnement ce mois-ci !",
    type: "promotion",
    priority: 2,
    active: true,
    createdAt: new Date().toISOString()
  }
];

// Get all banners
router.get("/banners", (req, res) => {
  try {
    // Return only active banners
    const activeBanners = banners.filter(banner => banner.active);
    res.json(activeBanners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
});

// Get banner by ID
router.get("/banners/:id", (req, res) => {
  try {
    const { id } = req.params;
    const banner = banners.find(b => b.id === id && b.active);
    
    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }
    
    res.json(banner);
  } catch (error) {
    console.error("Error fetching banner:", error);
    res.status(500).json({ error: "Failed to fetch banner" });
  }
});

// Get banners by type
router.get("/banners/type/:type", (req, res) => {
  try {
    const { type } = req.params;
    const typeBanners = banners.filter(banner => 
      banner.type === type && banner.active
    );
    
    res.json(typeBanners);
  } catch (error) {
    console.error("Error fetching banners by type:", error);
    res.status(500).json({ error: "Failed to fetch banners by type" });
  }
});

export default router;
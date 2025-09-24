import { Link, useLocation } from "wouter";
import { Home, Film, Tv, Heart, TrendingUp, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export default function MobileNav() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const navigationItems = [
    {
      href: "/",
      label: "Accueil",
      icon: Home,
      active: location === "/",
    },
    {
      href: "/category/28",
      label: "Films",
      icon: Film,
      active: location.startsWith("/category") || location.startsWith("/movie"),
    },
    {
      href: "/series",
      label: "Séries",
      icon: Tv,
      active: location === "/series" || location.startsWith("/tv"),
    },
    {
      href: "/trending",
      label: "Tendances",
      icon: TrendingUp,
      active: location === "/trending",
    },
    {
      href: isAuthenticated ? "/favorites" : "/search",
      label: isAuthenticated ? "Ma Liste" : "Recherche",
      icon: isAuthenticated ? Heart : Search,
      active: location === "/favorites" || location === "/search",
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border safe-area-bottom">
      <div className="flex items-center justify-center h-16 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <Button
                variant="ghost"
                className={`w-full h-12 flex flex-col items-center justify-center space-y-1 rounded-none ${
                  item.active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
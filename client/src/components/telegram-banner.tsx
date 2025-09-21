import { ExternalLink, MessageCircle, Bell, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TelegramBanner() {
  const handleJoinChannel = () => {
    // Your actual Telegram channel link
    window.open("https://t.me/+H99gpMNU1fgwNTQ0", "_blank");
  };

  return (
    <Card className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 border-0 overflow-hidden relative">
      <CardContent className="p-6 md:p-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white rounded-full"></div>
          <div className="absolute top-12 right-8 w-6 h-6 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-8 left-12 w-4 h-4 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-4 right-16 w-10 h-10 border-2 border-white rounded-full"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Side - Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Rejoignez notre canal Telegram
                </h2>
              </div>
            </div>
            
            <p className="text-blue-100 text-lg mb-6 max-w-md">
              Recevez les dernières nouveautés, sorties exclusives et actualités du streaming en temps réel !
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-blue-100 text-sm mb-6">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span>Notifications instantanées</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Communauté active</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                <span>Contenu exclusif</span>
              </div>
            </div>
          </div>

          {/* Right Side - Call to Action */}
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={handleJoinChannel}
              size="lg"
              className="bg-white hover:bg-blue-50 text-blue-700 font-semibold px-8 py-3 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Rejoindre le Canal
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            
            <div className="text-center">
              <p className="text-blue-200 text-sm">
                🎬 <span className="font-medium">+2,500</span> membres
              </p>
              <p className="text-blue-300 text-xs mt-1">
                Gratuit • Pas de spam
              </p>
            </div>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400"></div>
      </CardContent>
    </Card>
  );
}
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "node:url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import type { ViteDevServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Custom middleware to add CSP headers
const cspMiddleware = () => {
  return {
    name: 'csp-middleware',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: any, res: any, next: any) => {
        // Add CSP header to allow Zupload domains and YouTube iframes
        res.setHeader(
          'Content-Security-Policy',
          `default-src 'self'; ` +
          `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://www.gstatic.com https://www.google.com https://apis.google.com blob:; ` +
          `script-src-elem 'self' 'unsafe-inline' https://www.google-analytics.com https://www.gstatic.com https://www.google.com https://apis.google.com blob:; ` +
          `script-src-attr 'self' 'unsafe-inline'; ` +
          `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com https://translate.googleapis.com; ` +
          `img-src 'self' data: https: blob:; ` +
          `font-src 'self' data: https://fonts.gstatic.com; ` +
          `connect-src 'self' https://api.themoviedb.org https://image.tmdb.org https://*.googleapis.com https://*.youtube.com; ` +
          `frame-src 'self' https://odysee.com https://player.twitch.tv https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://zupload.cc https://zupload.io blob:; ` +
          `media-src 'self' blob: https:; ` +
          `worker-src 'self' blob:; ` +
          `child-src 'self' blob: https://zupload.cc https://zupload.io;`
        );
        next();
      });
    }
  };
};

export default defineConfig({
  plugins: [
    react(),
    cspMiddleware(),
    // runtimeErrorOverlay(), // Temporairement désactivé pour résoudre l'erreur DOM
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    hmr: {
      overlay: false // Désactive l'overlay d'erreur HMR
    },
    proxy: {
      '/api': {
        target: process.env.SERVER_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
});
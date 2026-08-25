import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "favicon.png",
        "apple-touch-icon.png",
        "passport-bg.png",
        "slid-logo.png",
        "offline.html",
        "icons/*",
      ],
      manifest: {
        name: "Sierra Leone Immigration & Border Management System",
        short_name: "SLID Portal",
        description: "Design & Implementation of a Web-Based Immigration Management System for Efficient Border Control — Sierra Leone Immigration Department (SLID)",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        theme_color: "#1E8E5A",
        background_color: "#F8F7F4",
        lang: "en",
        dir: "ltr",
        categories: ["government", "travel", "productivity", "utilities"],
        icons: [
          {
            src: "/icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/slid-logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
        shortcuts: [
          {
            name: "Apply for e-Visa",
            short_name: "e-Visa",
            description: "Submit a new Sierra Leone electronic visa application",
            url: "/visa/new",
            icons: [{ src: "/icons/icon-192x192.svg", sizes: "192x192" }],
          },
          {
            name: "Passport Clearance",
            short_name: "Passports",
            description: "View registered biometric passport and travel records",
            url: "/passport",
            icons: [{ src: "/icons/icon-192x192.svg", sizes: "192x192" }],
          },
          {
            name: "Border Check-In",
            short_name: "Border Desk",
            description: "Officer clearance and traveler verification portal",
            url: "/border/check-in",
            icons: [{ src: "/icons/icon-192x192.svg", sizes: "192x192" }],
          },
          {
            name: "Checkpoints Status",
            short_name: "Borders",
            description: "Live operational status of Sierra Leone entry posts",
            url: "/borders",
            icons: [{ src: "/icons/icon-192x192.svg", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "app-images",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});

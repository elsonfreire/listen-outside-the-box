import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()  ],
  server: {
    allowedHosts: ["17c1e0e82a0d.ngrok-free.app"]
  }
});

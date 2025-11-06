import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 12000,
    strictPort: true,
    cors: true,
    allowedHosts: ['work-1-rqvcdrdpwroeaxzd.prod-runtime.all-hands.dev', 'localhost'],
    headers: {
      'X-Frame-Options': 'ALLOWALL',
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('apexcharts') || id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('wagmi') || id.includes('viem') || id.includes('@web3modal')) {
              return 'vendor-web3';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }
            if (id.includes('ccxt')) {
              return 'vendor-exchange';
            }
            return 'vendor-other';
          }
          
          if (id.includes('/src/components/trading/')) {
            return 'trading-components';
          }
          if (id.includes('/src/lib/exchanges/')) {
            return 'exchange-adapters';
          }
          if (id.includes('/src/components/ui/')) {
            return 'ui-components';
          }
        },
      },
    },
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
      },
      mangle: {
        safari10: true,
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
}));

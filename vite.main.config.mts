import path from "node:path"
import { defineConfig } from "vite"

// https://vitejs.dev/config
// refernece https://github.com/electron/forge/issues/682
export default defineConfig({
  resolve: {
    // For Node.js native modules
    conditions: ["node"], // this is the change
    mainFields: ["module", "jsnext:main", "jsnext"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    {
      name: "restart",
      closeBundle() {
        process.stdin.emit("data", "rs")
      },
    },
  ],
  build: {
    rollupOptions: {
      // 關鍵：告訴 Vite 不要打包 koffi，讓它在運行時直接從 node_modules 讀取
      external: ["koffi"],
    },
  },
})

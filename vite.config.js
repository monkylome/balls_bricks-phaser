// Base './' ensures correct paths when deployed to GitHub Pages
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',  // use relative paths for assets
})
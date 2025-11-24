# Deployment Guide for GitHub Pages

This project is configured to deploy to GitHub Pages at `https://mohmedvaid.github.io/workflow-builder/` without overriding your existing portfolio.

## Option 1: Deploy to Subdirectory (Recommended)

The project is already configured to deploy to `/workflow-builder/` subdirectory.

### Steps:

1. **Enable GitHub Pages in your repository:**
   - Go to your repository settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions"

2. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Configure for GitHub Pages deployment"
   git push origin main
   ```

3. **The GitHub Action will automatically:**
   - Build the project
   - Deploy to `https://mohmedvaid.github.io/workflow-builder/`

## Option 2: Deploy to Separate Repository

If you prefer to keep it completely separate:

1. Create a new repository (e.g., `workflow-builder`)
2. Update `vite.config.ts` to use base path `/workflow-builder/` or `/` if it's the only site
3. Follow the same GitHub Actions workflow

## Option 3: Deploy to gh-pages Branch

If you prefer using the gh-pages branch method:

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

3. In repository settings, set GitHub Pages source to `gh-pages` branch

## Local Testing

To test the production build locally with the correct base path:

```bash
npm run build
npm run preview
```

The app will be available at `http://localhost:4173/workflow-builder/`

## Important Notes

- The base path is set to `/workflow-builder/` in production builds
- Your portfolio at `https://mohmedvaid.github.io/` will remain untouched
- The workflow builder will be accessible at `https://mohmedvaid.github.io/workflow-builder/`
- Make sure to update any hardcoded paths if you change the base path


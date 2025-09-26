# How to Deploy Collectto to GitHub Pages

Since you're using GitHub Desktop (not GitHub Actions), follow these steps to deploy your "collectto" repository:

## ✅ One-time setup (DONE):

Your vite.config.ts is already correctly configured with base path `/collectto/` ✓

## 🚀 Deploy Steps:

### 1. Install dependencies (if you haven't already):
Open terminal/command prompt in your project folder and run:
```bash
npm install
```

### 2. Build the project:
```bash
npm run build
```
This creates a `dist` folder with your compiled app that browsers can run.

### 3. Commit and push using GitHub Desktop:
- Open GitHub Desktop
- You'll see the new `dist` folder and any other changes
- Commit all changes with a message like "Add built files for deployment"
- Push to GitHub

### 4. Configure GitHub Pages (one-time):
- Go to https://github.com/YOUR-USERNAME/collectto/settings/pages
- Under "Source", select "Deploy from a branch"
- Under "Branch", select "main" and "/ (root)"
- Click "Save"

### 5. Your site will be live at:
```
https://YOUR-USERNAME.github.io/collectto/
```

## 🔄 For future updates:

Every time you make changes:
1. Run `npm run build`
2. Commit and push with GitHub Desktop
3. GitHub Pages will automatically update your live site

## 💡 Pro tip:

Add the `dist` folder to your commits. Unlike typical development where you'd ignore build files, for GitHub Pages deployment without Actions, you need the built files in your repository.

## ❓ Troubleshooting:

- **404 errors**: Make sure you're visiting `https://YOUR-USERNAME.github.io/collectto/` (with the `/collectto/` at the end)
- **Old content**: GitHub Pages can take a few minutes to update after pushing changes
- **Build errors**: Make sure `npm run build` completes without errors before committing
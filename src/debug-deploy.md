# Deployment Debugging Guide

## Repository Name Detection

If you're still getting 404 errors after committing these changes, the issue might be with the repository name. Here's how to fix it:

### 1. Check your GitHub repository name
Your repository URL should be something like: `https://github.com/mykocorp/REPO_NAME`

The part after the slash (`REPO_NAME`) is what matters for GitHub Pages.

### 2. Update vite.config.ts if needed
If your repository name is not being detected correctly, you can hardcode it in `vite.config.ts`:

```typescript
// Replace the getBasePath function with:
const getBasePath = () => {
  return '/YOUR_ACTUAL_REPO_NAME/'; // Replace with your actual repo name
};
```

### 3. Common GitHub Pages URLs
- If your repo is named `collectto`: `https://mykocorp.github.io/collectto/`
- If your repo is named `collectto-app`: `https://mykocorp.github.io/collectto-app/`
- If your repo is named the same as your username: `https://mykocorp.github.io/`

### 4. Debugging steps
1. Check the Actions tab in your GitHub repository to see if the build is succeeding
2. Look at the "List build output" step to see what files are being generated
3. Check the `dist/index.html` file contents to see if the script tags have the correct paths

### 5. Alternative: Use root deployment
If you want the app to deploy to `https://mykocorp.github.io/` (without a subdirectory), you'll need to:
1. Rename your repository to `mykocorp.github.io`
2. Update the base path in vite.config.ts to just `/`

## After making changes
1. Commit and push your changes
2. Wait for the GitHub Action to complete
3. Check the GitHub Pages settings in your repository (Settings > Pages)
4. Make sure it's set to deploy from the `gh-pages` branch

The build process should now work correctly with these fixes!
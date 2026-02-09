# Deployment Guide for Render

## Prerequisites

1. A GitHub account
2. A Render account (sign up at https://render.com)

## Steps to Deploy

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Rent burden visualization"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy on Render

1. Go to https://dashboard.render.com
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` configuration
5. The service will be configured with:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

### 3. Verify Deployment

Once deployed, your visualization will be available at the Render-provided URL (e.g., `https://rent-burden-visualization.onrender.com`)

## Environment Variables

No environment variables are required for this deployment.

## Troubleshooting

- If the build fails, check that all dependencies are listed in `package.json`
- If the CSV file isn't loading, verify it's in the `public/` directory
- Check Render logs for any runtime errors

# Deployment Guide for Render

## Prerequisites

1. A GitHub account
2. A Render account (sign up at https://render.com)

## Steps to Deploy

### 1. Prepare Your Repository

Make sure your project is ready:
- All source files are committed
- CSV data file is in the `public/` directory
- `render.yaml` is in the root directory
- `.gitignore` excludes `node_modules`, `.next`, and other build artifacts

### 2. Push to GitHub

If you haven't already, initialize and push your repository:

```bash
# Initialize git (if not already done)
git init

# Add all files (respecting .gitignore)
git add .

# Commit your changes
git commit -m "Initial commit: Rent burden visualization"

# Rename branch to main (if needed)
git branch -M main

# Add your GitHub repository as remote
git remote add origin <your-github-repo-url>

# Push to GitHub
git push -u origin main
```

**Important files to commit:**
- All source code (`app/`, `components/`, `lib/`)
- Configuration files (`package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.js`, etc.)
- `render.yaml` (deployment configuration)
- `public/Metro_zori_uc_sfrcondomfr_sm_month.csv` (data file)
- `README.md` and `DEPLOYMENT.md`

**Files that should NOT be committed (already in .gitignore):**
- `node_modules/`
- `.next/`
- `.DS_Store`
- `*.tsbuildinfo`
- `next-env.d.ts`

### 3. Deploy on Render

1. Go to https://dashboard.render.com
2. Click "New +" and select "Web Service"
3. Connect your GitHub account (if not already connected)
4. Select your repository from the list
5. Render will automatically detect the `render.yaml` configuration file
6. The service will be configured with:
   - **Name**: `rent-burden-visualization`
   - **Plan**: Free
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Health Check Path**: `/`

7. Click "Create Web Service"
8. Render will start building and deploying your application

### 4. Verify Deployment

- Wait for the build to complete (usually 2-5 minutes)
- Once deployed, your visualization will be available at the Render-provided URL (e.g., `https://rent-burden-visualization.onrender.com`)
- Visit the URL to verify everything is working

## Configuration Details

The `render.yaml` file configures:
- **Service Type**: Web service
- **Node Version**: Automatically detected (requires Node >= 18.0.0)
- **Build**: Runs `npm install && npm run build`
- **Start**: Runs `npm start` (uses Next.js standalone output)
- **Health Check**: Monitors the root path `/`

## Environment Variables

No environment variables are required for this deployment. The `NODE_ENV` is automatically set to `production` by Render.

## Troubleshooting

- **Build fails**: 
  - Check that all dependencies are listed in `package.json`
  - Verify Node version compatibility (requires Node >= 18.0.0)
  - Check Render build logs for specific errors

- **CSV file not loading**: 
  - Verify `Metro_zori_uc_sfrcondomfr_sm_month.csv` is in the `public/` directory
  - Ensure the file is committed to GitHub
  - Check browser console for 404 errors

- **Application crashes**: 
  - Check Render logs for runtime errors
  - Verify all environment variables are set correctly
  - Ensure the build completed successfully

- **Slow performance**: 
  - Free tier on Render may spin down after inactivity
  - First request after spin-down may take 30-60 seconds
  - Consider upgrading to a paid plan for better performance

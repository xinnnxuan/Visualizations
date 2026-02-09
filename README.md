# Rent Burden Visualization

An interactive data visualization showing how rent has risen faster than wages across major U.S. cities.

## Features

- **City Selection**: Choose from major metropolitan areas
- **Income Percentile Slider**: See how rent burden affects different income levels (25th, 50th, 75th percentile)
- **Animated Timeline**: Watch rent burden change over time from 2015 to 2024
- **30% Threshold Highlight**: Visual indicator of the affordability threshold
- **City Comparison**: Compare rent burden across multiple cities

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment on Render

This project is configured for deployment on Render. The `render.yaml` file contains the deployment configuration.

1. Push your code to a Git repository
2. Connect your repository to Render
3. Render will automatically detect the configuration and deploy

## Data Sources

- **Rent Data**: Zillow Observed Rent Index (ZORI)
- **Income Data**: Estimated based on American Community Survey (ACS) median household income

## Technology Stack

- Next.js 14
- React 18
- Recharts for visualizations
- Tailwind CSS for styling
- TypeScript

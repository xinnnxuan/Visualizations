# Interactive 4D Hypercube Visualization

An interactive web-based visualization of a 4-dimensional hypercube (tesseract) with rotation controls and dimension selection.

## Features

- **Interactive 4D Hypercube**: Visualize a tesseract projected into 3D space
- **Mouse Controls**: Click and drag to rotate the hypercube
- **Dimension Selector**: Choose which dimension plane to rotate (X-Y, X-Z, X-W, Y-Z)
- **Zoom Controls**: Scroll to zoom in/out
- **Color-coded Vertices**: Vertices are color-coded based on their 4D position

## Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

3. Open your browser and navigate to `http://localhost:5000`

## Deployment on Render

1. Push your code to a Git repository (GitHub, GitLab, etc.)

2. On Render.com:
   - Create a new Web Service
   - Connect your repository
   - Render will automatically detect the `render.yaml` file
   - Or manually set:
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn app:app`
     - **Environment**: Python 3

3. Deploy!

The application will be available at your Render-provided URL.

## Usage

- **Click and Drag**: Rotate the hypercube in the selected dimension plane
- **Scroll**: Zoom in/out
- **Dimension Buttons**: Select which rotation plane to control (X-Y, X-Z, X-W, Y-Z)

## Technical Details

- Built with Flask (Python backend)
- Three.js for 3D rendering
- 4D to 3D perspective projection
- Real-time rotation matrix calculations

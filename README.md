# Image Compression App

A simple web-based tool for compressing images and seeing the compression ratio.

## Features

- Drag-and-drop interface for image uploads
- Adjustable compression quality
- Shows original and compressed file sizes
- Displays compression ratio percentage
- Download compressed images

## Usage

### Standalone Mode

1. Clone this repository:
```
git clone https://github.com/yourusername/image-compression-app.git
cd image-compression-app
```

2. Install dependencies:
```
pip install Flask Pillow
```

3. Run the app:
```
python run.py
```

4. Open your browser and navigate to `http://localhost:5001`

### With HomeTools

This app can be installed and run directly from [HomeTools](https://github.com/yourusername/HomeTools).

## Requirements

- Python 3.7+
- Flask
- Pillow (PIL Fork)

## How It Works

The app uses the Python Imaging Library (Pillow) to compress images by adjusting the quality level. It preserves the original format of the image while optimizing its file size.

## License

This project is licensed under the MIT License. 
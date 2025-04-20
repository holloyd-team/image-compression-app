import os
import tempfile
from flask import Flask, render_template, request, jsonify, send_from_directory
from PIL import Image
import io
import base64

def get_app():
    """Return the Flask app instance for integration with the parent app"""
    app = Flask(__name__, 
                template_folder='templates',
                static_folder='static')
    
    # Register the routes
    register_routes(app)
    
    return app

def register_routes(app):
    """Register the routes for the app"""
    
    @app.route('/image-compression-app/compress', methods=['POST'])
    def compress_image():
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400
        
        image_file = request.files['image']
        if not image_file.filename:
            return jsonify({'error': 'No image selected'}), 400
        
        quality = int(request.form.get('quality', 85))
        
        try:
            # Read the original image
            original_img = Image.open(image_file)
            
            # Get the original size in bytes - save the file position first
            image_file.seek(0, os.SEEK_END)
            original_size = image_file.tell()
            image_file.seek(0)  # Reset file position to beginning
            
            # Compress the image
            compressed_data = io.BytesIO()
            
            # Use appropriate format-specific parameters
            if original_img.format == 'JPEG' or original_img.format == 'JPG' or original_img.format is None:
                # Convert to RGB if necessary (for transparency)
                if original_img.mode in ('RGBA', 'LA'):
                    original_img = original_img.convert('RGB')
                original_img.save(compressed_data, format='JPEG', quality=quality, optimize=True)
            elif original_img.format == 'PNG':
                original_img.save(compressed_data, format='PNG', optimize=True, 
                                compression=9 if quality < 50 else 6)
            elif original_img.format == 'WEBP':
                original_img.save(compressed_data, format='WEBP', quality=quality)
            else:
                # Default fallback for other formats
                original_img.save(compressed_data, format=original_img.format, optimize=True)
                
            compressed_size = len(compressed_data.getvalue())
            
            # Calculate compression ratio
            compression_ratio = (original_size - compressed_size) / original_size * 100 if original_size > 0 else 0
            
            # Prepare result without saving to disk
            compressed_data.seek(0)
            compressed_base64 = f"data:image/{original_img.format.lower() if original_img.format else 'jpeg'};base64," + \
                               base64.b64encode(compressed_data.getvalue()).decode('utf-8')
            
            return jsonify({
                'original_size': original_size,
                'compressed_size': compressed_size,
                'compression_ratio': round(compression_ratio, 2),
                'compressed_data': compressed_base64
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/image-compression-app/get_resources')
    def get_resources():
        """Return the resources needed to render the app"""
        return jsonify({
            'html': f'/api/image-compression-app/index',  # Use actual app name instead of app.name
            'css': '/static/image-compression-app/css/style.css',
            'js': '/static/image-compression-app/js/app.js'
        })
    
    @app.route('/image-compression-app/')
    def index():
        """Render the main app template when run standalone"""
        return render_template('index.html')
    
    @app.route('/image-compression-app/index')
    def get_index_html():
        """Return the app's HTML content directly"""
        return render_template('index.html')
    
    # Add routes for standalone mode
    @app.route('/')
    def standalone_index():
        """Render the main app template when run standalone"""
        return render_template('index.html')
    
    @app.route('/compress', methods=['POST'])
    def standalone_compress():
        """Compress image endpoint for standalone mode"""
        return compress_image()
    
    @app.route('/get_resources')
    def standalone_get_resources():
        """Get resources endpoint for standalone mode"""
        return get_resources()

# Allow the app to be run standalone
if __name__ == '__main__':
    app = Flask(__name__, 
                template_folder='templates',
                static_folder='static')
    register_routes(app)
    app.run(debug=True, port=5001) 
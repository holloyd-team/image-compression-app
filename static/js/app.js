// Image Compression App JavaScript

// DOM Elements
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const previewContainer = document.getElementById('preview-container');
const previewImage = document.getElementById('preview-image');
const clearBtn = document.getElementById('clear-btn');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('quality-value');
const compressBtn = document.getElementById('compress-btn');
const resultsSection = document.getElementById('results-section');
const originalSizeEl = document.getElementById('original-size');
const compressedSizeEl = document.getElementById('compressed-size');
const compressionRatioEl = document.getElementById('compression-ratio');
const downloadBtn = document.getElementById('download-btn');
const loadingOverlay = document.getElementById('loading-overlay');

// Variables
let currentFile = null;
let compressedFile = null;
let compressedImage = null;

// Determine if we're running in standalone mode by checking the URL path
const path = window.location.pathname;
console.log('Current path:', path);
const isStandalone = path === '/' || path === '/index.html' || path.endsWith('/image-compression-app/') || path.endsWith('/image-compression-app');
console.log('Running in standalone mode:', isStandalone);

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Make sure loading overlay is hidden initially
    if (loadingOverlay) {
        loadingOverlay.hidden = true;
    }
    
    // Set initial quality value display
    if (qualitySlider && qualityValue) {
        qualityValue.textContent = qualitySlider.value + '%';
    }
    
    // Initialize the app
    initDropArea();
    initFileInput();
    initQualitySlider();
    initCompressButton();
    initClearButton();
    initDownloadButton();
    
    // Add error handling for image loading
    previewImage.addEventListener('error', function(event) {
        // Prevent infinite loop by checking if we're already trying to load the error image
        if (!this.src.includes('image-error.png') && !this.hasErrored) {
            this.hasErrored = true;
            console.error('Failed to load image preview');
            
            // Use a simple placeholder instead of loading another image
            this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23ff6b6b' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='15' y1='9' x2='9' y2='15'%3E%3C/line%3E%3Cline x1='9' y1='9' x2='15' y2='15'%3E%3C/line%3E%3C/svg%3E";
        }
    });
});

// Get the appropriate path for a resource based on whether we're in standalone mode or not
function getResourcePath(path) {
    return isStandalone ? path : `/static/image-compression-app/${path}`;
}

// Initialize drag and drop functionality
function initDropArea() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    // Find the browse button and add a click handler to it
    const browseBtn = document.querySelector('.upload-btn');
    if (browseBtn) {
        browseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent event from bubbling up to the drop area
            fileInput.click();
        });
    }
    
    // Make the entire drop area clickable to open file dialog
    // except when clicking on the clear button
    dropArea.addEventListener('click', function(e) {
        // Don't open file dialog if clicking the clear button or its children
        if (e.target.id === 'clear-btn' || e.target.closest('#clear-btn')) {
            return;
        }
        
        // For all other clicks on the drop area or its children, open file dialog
        fileInput.click();
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    dropArea.classList.add('highlight');
}

function unhighlight() {
    dropArea.classList.remove('highlight');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length) {
        handleFile(files[0]);
    }
}

// Initialize file input handling
function initFileInput() {
    fileInput.addEventListener('change', (e) => {
        // Reset the file input if it has no files to ensure it triggers 'change' even with the same file
        if (!e.target.files.length) {
            fileInput.value = '';
            return;
        }
        
        handleFile(e.target.files[0]);
    });
}

// Add a function to show a disappearing alert
function showTemporaryAlert(message, duration = 3000) {
    // Create alert element if it doesn't exist
    let alertElement = document.getElementById('temporary-alert');
    if (!alertElement) {
        alertElement = document.createElement('div');
        alertElement.id = 'temporary-alert';
        alertElement.style.position = 'fixed';
        alertElement.style.top = '20px';
        alertElement.style.left = '50%';
        alertElement.style.transform = 'translateX(-50%)';
        alertElement.style.backgroundColor = '#ff6b6b';
        alertElement.style.color = 'white';
        alertElement.style.padding = '10px 20px';
        alertElement.style.borderRadius = '4px';
        alertElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        alertElement.style.zIndex = '9999';
        alertElement.style.opacity = '0';
        alertElement.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(alertElement);
    }
    
    // Set message and show alert
    alertElement.textContent = message;
    alertElement.style.opacity = '1';
    
    // Hide alert after duration
    setTimeout(() => {
        alertElement.style.opacity = '0';
    }, duration);
}

function handleFile(file) {
    // Check if file is an image with supported types
    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp'];
    
    if (!file.type.match('image.*') || !supportedTypes.includes(file.type)) {
        showTemporaryAlert('Unsupported file type. Please use JPEG, PNG, GIF, BMP, TIFF, or WebP images.');
        return;
    }
    
    // Log file details
    console.log('File selected:', file.name);
    console.log('File type:', file.type);
    console.log('File size:', file.size, 'bytes (', formatFileSize(file.size), ')');
    
    // Store the file
    currentFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewContainer.hidden = false;
        document.querySelector('.upload-instruction').hidden = true;
        enableCompressButton();
    };
    reader.onerror = () => {
        showError('Failed to read the selected file. Please try again.');
    };
    reader.readAsDataURL(file);
}

// Initialize quality slider
function initQualitySlider() {
    console.log('Initializing quality slider:', qualitySlider);
    
    if (!qualitySlider || !qualityValue) {
        console.error('Quality slider or value element not found');
        return;
    }
    
    // Set initial value to match the default in HTML
    qualityValue.textContent = qualitySlider.value + '%';
    
    qualitySlider.addEventListener('input', function(e) {
        console.log('Slider value changed to:', e.target.value);
        qualityValue.textContent = e.target.value + '%';
    });
}

// Initialize compress button
function initCompressButton() {
    console.log('Initializing compress button:', compressBtn);
    
    if (compressBtn) {
        compressBtn.addEventListener('click', function(e) {
            console.log('Compress button clicked');
            compressImage();
        });
    } else {
        console.error('Compress button not found in the DOM');
    }
}

function enableCompressButton() {
    compressBtn.disabled = false;
}

function disableCompressButton() {
    compressBtn.disabled = true;
}

// Initialize clear button
function initClearButton() {
    console.log('Initializing clear button:', clearBtn);
    
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
            console.log('Clear button clicked');
            clearImage();
        });
    } else {
        console.error('Clear button not found in the DOM');
    }
}

function clearImage() {
    currentFile = null;
    compressedFile = null;
    compressedImage = null;
    previewImage.src = '';
    previewContainer.hidden = true;
    document.querySelector('.upload-instruction').hidden = false;
    disableCompressButton();
    resultsSection.hidden = true;
    resetResults();
    
    // Reset the file input value to ensure 'change' event can be triggered with same file
    fileInput.value = '';
}

// Initialize download button
function initDownloadButton() {
    downloadBtn.addEventListener('click', downloadCompressedImage);
}

// Get the appropriate API endpoint based on whether we're in standalone mode or not
function getCompressEndpoint() {
    // Log for debugging
    console.log('Current pathname:', window.location.pathname);
    console.log('isStandalone:', isStandalone);
    
    const endpoint = isStandalone ? '/compress' : '/image-compression-app/compress';
    console.log('Using endpoint:', endpoint);
    return endpoint;
}

function getDownloadEndpoint(filename) {
    return isStandalone ? `/download/${filename}` : `/image-compression-app/download/${filename}`;
}

// Show error message to the user
function showError(message) {
    alert(message);
    console.error(message);
}

// Compress the image
function compressImage() {
    console.log('compressImage called');
    
    if (!currentFile) {
        console.error('No file selected for compression');
        return;
    }
    
    console.log('File to compress:', currentFile.name, 'type:', currentFile.type, 'size:', currentFile.size);
    console.log('Quality setting:', qualitySlider.value);
    
    // Show loading overlay
    loadingOverlay.classList.add('visible');
    loadingOverlay.hidden = false;
    
    const endpoint = getCompressEndpoint();
    console.log('Sending compression request to:', endpoint);
    
    // Create form data
    const formData = new FormData();
    formData.append('image', currentFile);
    formData.append('quality', qualitySlider.value);
    
    // Send request to server
    fetch(endpoint, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Server response status:', response.status);
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Compression successful, data received:', Object.keys(data));
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Hide loading overlay
        loadingOverlay.classList.remove('visible');
        loadingOverlay.hidden = true;
        
        // Display results
        displayResults(data);
        
        // Save the compressed data
        compressedImage = {
            data: data.compressed_data,
            format: currentFile.type.split('/')[1] || 'jpeg'
        };
        
        // Enable download button
        downloadBtn.disabled = false;
    })
    .catch(error => {
        console.error('Compression error:', error);
        
        // Hide loading overlay
        loadingOverlay.classList.remove('visible');
        loadingOverlay.hidden = true;
        
        showError(`Error compressing image: ${error.message}`);
    });
}

// Display compression results
function displayResults(data) {
    console.log('Displaying compression results:', data);
    
    // Format sizes
    const originalSizeFormatted = formatFileSize(data.original_size);
    const compressedSizeFormatted = formatFileSize(data.compressed_size);
    
    console.log('Original size:', data.original_size, '(', originalSizeFormatted, ')');
    console.log('Compressed size:', data.compressed_size, '(', compressedSizeFormatted, ')');
    
    // Determine if compression was successful or resulted in a larger file
    const isCompressedLarger = data.compressed_size > data.original_size;
    
    // Display results
    originalSizeEl.textContent = originalSizeFormatted;
    compressedSizeEl.textContent = compressedSizeFormatted;
    
    // Set compression ratio with appropriate color
    const ratioValue = data.compression_ratio;
    compressionRatioEl.textContent = `${ratioValue}%`;
    
    // Style the compression ratio based on the result
    if (isCompressedLarger) {
        compressionRatioEl.style.color = '#ff6b6b'; // Red color for negative compression
        compressionRatioEl.parentElement.style.backgroundColor = '#ffeeee';
        compressionRatioEl.parentElement.style.border = '1px solid #ff6b6b';
        
        // Also highlight the compressed size to show it's larger
        compressedSizeEl.style.color = '#ff6b6b';
        compressedSizeEl.parentElement.style.backgroundColor = '#ffeeee';
        compressedSizeEl.parentElement.style.border = '1px solid #ff6b6b';
    } else {
        // Reset styles for positive compression
        compressionRatioEl.style.color = ''; 
        compressionRatioEl.parentElement.style.backgroundColor = '';
        compressionRatioEl.parentElement.style.border = '';
        
        compressedSizeEl.style.color = '';
        compressedSizeEl.parentElement.style.backgroundColor = '';
        compressedSizeEl.parentElement.style.border = '';
    }
    
    // Show results section
    resultsSection.hidden = false;
    
    // Scroll to results section
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Reset results
function resetResults() {
    originalSizeEl.textContent = '-';
    compressedSizeEl.textContent = '-';
    compressionRatioEl.textContent = '-';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === undefined || bytes === null) {
        console.error('Invalid file size value:', bytes);
        return 'Unknown';
    }
    
    const numBytes = Number(bytes);
    if (isNaN(numBytes)) {
        console.error('File size is not a number:', bytes);
        return 'Unknown';
    }
    
    if (numBytes < 1024) return numBytes + ' B';
    else if (numBytes < 1048576) return (numBytes / 1024).toFixed(2) + ' KB';
    else return (numBytes / 1048576).toFixed(2) + ' MB';
}

// Download compressed image
function downloadCompressedImage() {
    if (!compressedImage || !compressedImage.data) {
        showError('No compressed image available!');
        return;
    }
    
    try {
        // Create a download link
        const link = document.createElement('a');
        
        // Get the base64 data
        // The data is in hex format, convert it to base64
        const base64Data = compressedImage.data;
        
        // Set link properties
        link.href = base64Data;
        link.download = `compressed_image.${compressedImage.format}`;
        
        // Append to document, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        showError(`Error downloading image: ${error.message}`);
    }
} 
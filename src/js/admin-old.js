// Admin Portal JavaScript - Image Management System
class ImageManager {
  constructor() {
    this.uploadZone = document.getElementById('uploadZone');
    this.fileInput = document.getElementById('fileInput');
    this.imageCategory = document.getElementById('imageCategory');
    this.projectInfo = document.getElementById('projectInfo');
    this.uploadBtn = document.getElementById('uploadBtn');
    this.uploadProgress = document.getElementById('uploadProgress');
    this.progressBar = document.getElementById('progressBar');
    this.progressText = document.getElementById('progressText');
    this.validationResults = document.getElementById('validationResults');
    this.validationList = document.getElementById('validationList');
    this.previewArea = document.getElementById('previewArea');
    this.previewGrid = document.getElementById('previewGrid');
    
    this.selectedFiles = [];
    this.imageRequirements = this.getImageRequirements();
    
    this.initializeEventListeners();
    this.loadExistingImages();
  }

  getImageRequirements() {
    return {
      'hero': {
        width: 1920,
        height: 1080,
        maxSize: 2 * 1024 * 1024, // 2MB
        formats: ['image/jpeg', 'image/png', 'image/webp'],
        aspectRatio: 16/9
      },
      'project-gallery': {
        width: 1200,
        height: 800,
        maxSize: 1.5 * 1024 * 1024, // 1.5MB
        formats: ['image/jpeg', 'image/webp'],
        aspectRatio: 3/2
      },
      'project-thumbnail': {
        width: 400,
        height: 300,
        maxSize: 500 * 1024, // 500KB
        formats: ['image/jpeg', 'image/webp'],
        aspectRatio: 4/3
      },
      'team': {
        width: 300,
        height: 300,
        maxSize: 300 * 1024, // 300KB
        formats: ['image/jpeg', 'image/webp'],
        aspectRatio: 1
      },
      'logo': {
        width: null, // Vector preferred
        height: null,
        maxSize: 200 * 1024, // 200KB
        formats: ['image/svg+xml', 'image/png'],
        aspectRatio: null
      },
      'interior': {
        width: 1200,
        height: 900,
        maxSize: 1.2 * 1024 * 1024, // 1.2MB
        formats: ['image/jpeg', 'image/webp'],
        aspectRatio: 4/3
      }
    };
  }

  initializeEventListeners() {
    // Category change
    this.imageCategory.addEventListener('change', (e) => {
      const isProjectCategory = ['project-gallery', 'project-thumbnail'].includes(e.target.value);
      this.projectInfo.style.display = isProjectCategory ? 'grid' : 'none';
      this.validateSelectedFiles();
    });

    // Upload zone interactions
    this.uploadZone.addEventListener('click', () => {
      this.fileInput.click();
    });

    this.uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadZone.classList.add('dragover');
    });

    this.uploadZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      this.uploadZone.classList.remove('dragover');
    });

    this.uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadZone.classList.remove('dragover');
      const files = Array.from(e.dataTransfer.files);
      this.handleFileSelection(files);
    });

    // File input change
    this.fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      this.handleFileSelection(files);
    });

    // Upload button
    this.uploadBtn.addEventListener('click', () => {
      this.uploadImages();
    });

    // Filter controls
    document.getElementById('filterCategory').addEventListener('change', (e) => {
      this.filterImages('category', e.target.value);
    });

    document.getElementById('filterProject').addEventListener('change', (e) => {
      this.filterImages('project', e.target.value);
    });

    document.getElementById('searchImages').addEventListener('input', (e) => {
      this.searchImages(e.target.value);
    });

    document.getElementById('refreshImages').addEventListener('click', () => {
      this.loadExistingImages();
    });
  }

  handleFileSelection(files) {
    this.selectedFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (this.selectedFiles.length === 0) {
      this.showNotification('Please select valid image files.', 'error');
      return;
    }

    this.validateSelectedFiles();
    this.generatePreviews();
    this.updateUploadButton();
  }

  validateSelectedFiles() {
    const category = this.imageCategory.value;
    if (!category) {
      this.showValidationResults([]);
      return;
    }

    const requirements = this.imageRequirements[category];
    const validationPromises = this.selectedFiles.map(file => this.validateFile(file, requirements));

    Promise.all(validationPromises).then(results => {
      this.showValidationResults(results);
    });
  }

  async validateFile(file, requirements) {
    const result = {
      name: file.name,
      size: file.size,
      type: file.type,
      errors: [],
      warnings: [],
      valid: true
    };

    // Check file size
    if (file.size > requirements.maxSize) {
      result.errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum (${this.formatFileSize(requirements.maxSize)})`);
      result.valid = false;
    }

    // Check file format
    if (!requirements.formats.includes(file.type)) {
      result.errors.push(`Format ${file.type} not supported. Use: ${requirements.formats.join(', ')}`);
      result.valid = false;
    }

    // Check dimensions (for non-SVG images)
    if (file.type !== 'image/svg+xml' && requirements.width && requirements.height) {
      try {
        const dimensions = await this.getImageDimensions(file);
        
        if (dimensions.width !== requirements.width || dimensions.height !== requirements.height) {
          result.errors.push(`Dimensions ${dimensions.width}×${dimensions.height}px don't match required ${requirements.width}×${requirements.height}px`);
          result.valid = false;
        }

        // Check aspect ratio tolerance
        const actualRatio = dimensions.width / dimensions.height;
        const expectedRatio = requirements.aspectRatio;
        if (expectedRatio && Math.abs(actualRatio - expectedRatio) > 0.1) {
          result.warnings.push(`Aspect ratio ${actualRatio.toFixed(2)} differs from expected ${expectedRatio.toFixed(2)}`);
        }
      } catch (error) {
        result.errors.push('Unable to read image dimensions');
        result.valid = false;
      }
    }

    return result;
  }

  getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  showValidationResults(results) {
    if (results.length === 0) {
      this.validationResults.classList.add('hidden');
      return;
    }

    this.validationResults.classList.remove('hidden');
    this.validationList.innerHTML = '';

    results.forEach(result => {
      const resultElement = document.createElement('div');
      resultElement.className = `p-3 rounded-md border ${result.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`;
      
      let content = `
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <span class="status-indicator ${result.valid ? 'status-success' : 'status-error'}"></span>
          </div>
          <div class="ml-2">
            <p class="font-medium text-sm">${result.name}</p>
            <p class="text-xs text-gray-600">${this.formatFileSize(result.size)} • ${result.type}</p>
      `;

      if (result.errors.length > 0) {
        content += `<ul class="mt-1 text-xs text-red-600">`;
        result.errors.forEach(error => {
          content += `<li>• ${error}</li>`;
        });
        content += `</ul>`;
      }

      if (result.warnings.length > 0) {
        content += `<ul class="mt-1 text-xs text-yellow-600">`;
        result.warnings.forEach(warning => {
          content += `<li>• ${warning}</li>`;
        });
        content += `</ul>`;
      }

      content += `
          </div>
        </div>
      `;

      resultElement.innerHTML = content;
      this.validationList.appendChild(resultElement);
    });
  }

  generatePreviews() {
    this.previewArea.classList.remove('hidden');
    this.previewGrid.innerHTML = '';

    this.selectedFiles.forEach((file, index) => {
      const previewElement = document.createElement('div');
      previewElement.className = 'relative group';
      
      const img = document.createElement('img');
      img.className = 'image-preview w-full h-32 object-cover rounded-lg';
      img.src = URL.createObjectURL(file);
      img.alt = file.name;
      
      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center';
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'text-white bg-red-500 hover:bg-red-600 rounded-full p-2 transition-colors';
      removeBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `;
      removeBtn.addEventListener('click', () => this.removeFile(index));
      
      overlay.appendChild(removeBtn);
      previewElement.appendChild(img);
      previewElement.appendChild(overlay);
      
      const fileName = document.createElement('p');
      fileName.className = 'text-xs text-gray-600 mt-1 truncate';
      fileName.textContent = file.name;
      previewElement.appendChild(fileName);
      
      this.previewGrid.appendChild(previewElement);
    });
  }

  removeFile(index) {
    this.selectedFiles.splice(index, 1);
    this.generatePreviews();
    this.validateSelectedFiles();
    this.updateUploadButton();
    
    if (this.selectedFiles.length === 0) {
      this.previewArea.classList.add('hidden');
      this.validationResults.classList.add('hidden');
    }
  }

  updateUploadButton() {
    const hasFiles = this.selectedFiles.length > 0;
    const hasCategory = this.imageCategory.value;
    const isValid = hasFiles && hasCategory;
    
    this.uploadBtn.disabled = !isValid;
    this.uploadBtn.textContent = hasFiles ? `Upload ${this.selectedFiles.length} Image${this.selectedFiles.length > 1 ? 's' : ''}` : 'Upload Images';
  }

  async uploadImages() {
    if (this.selectedFiles.length === 0) return;

    this.uploadProgress.classList.remove('hidden');
    this.uploadBtn.disabled = true;

    const category = this.imageCategory.value;
    const projectData = this.getProjectData();

    try {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        const file = this.selectedFiles[i];
        const progress = ((i + 1) / this.selectedFiles.length) * 100;
        
        this.updateProgress(progress);
        
        // Simulate upload process
        await this.uploadSingleImage(file, category, projectData);
        
        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      this.showNotification('Images uploaded successfully!', 'success');
      this.resetForm();
      this.loadExistingImages();

    } catch (error) {
      console.error('Upload error:', error);
      this.showNotification('Upload failed. Please try again.', 'error');
    } finally {
      this.uploadProgress.classList.add('hidden');
      this.uploadBtn.disabled = false;
      this.updateProgress(0);
    }
  }

  async uploadSingleImage(file, category, projectData) {
    // In a real implementation, this would upload to your server
    // For now, we'll simulate the upload and store in localStorage
    
    const imageData = {
      id: Date.now() + Math.random(),
      name: file.name,
      category: category,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      project: projectData,
      url: URL.createObjectURL(file) // In production, this would be the server URL
    };

    // Store in localStorage (in production, send to server)
    const existingImages = JSON.parse(localStorage.getItem('cityExperts_images') || '[]');
    existingImages.push(imageData);
    localStorage.setItem('cityExperts_images', JSON.stringify(existingImages));

    return imageData;
  }

  getProjectData() {
    if (!['project-gallery', 'project-thumbnail'].includes(this.imageCategory.value)) {
      return null;
    }

    return {
      name: document.getElementById('projectName').value,
      location: document.getElementById('projectLocation').value,
      type: document.getElementById('projectType').value,
      status: document.getElementById('projectStatus').value
    };
  }

  updateProgress(percentage) {
    this.progressBar.style.width = `${percentage}%`;
    this.progressText.textContent = `${Math.round(percentage)}%`;
  }

  resetForm() {
    this.selectedFiles = [];
    this.fileInput.value = '';
    this.imageCategory.value = '';
    this.projectInfo.style.display = 'none';
    this.previewArea.classList.add('hidden');
    this.validationResults.classList.add('hidden');
    this.updateUploadButton();
    
    // Clear project form
    document.getElementById('projectName').value = '';
    document.getElementById('projectLocation').value = '';
    document.getElementById('projectType').value = '';
    document.getElementById('projectStatus').value = 'completed';
  }

  loadExistingImages() {
    const existingImages = JSON.parse(localStorage.getItem('cityExperts_images') || '[]');
    const grid = document.getElementById('existingImagesGrid');
    
    if (existingImages.length === 0) {
      grid.innerHTML = `
        <div class="text-center py-8 col-span-full text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p>No images found. Upload some images to get started.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = '';
    existingImages.forEach(image => {
      const imageElement = this.createImageElement(image);
      grid.appendChild(imageElement);
    });
  }

  createImageElement(image) {
    const element = document.createElement('div');
    element.className = 'relative group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow';
    
    element.innerHTML = `
      <div class="aspect-w-4 aspect-h-3">
        <img src="${image.url}" alt="${image.name}" class="w-full h-32 object-cover">
      </div>
      <div class="p-3">
        <p class="text-sm font-medium text-gray-900 truncate">${image.name}</p>
        <p class="text-xs text-gray-500">${image.category}</p>
        <p class="text-xs text-gray-400">${this.formatFileSize(image.size)}</p>
        ${image.project ? `<p class="text-xs text-blue-600">${image.project.name}</p>` : ''}
      </div>
      <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button class="delete-btn bg-red-500 hover:bg-red-600 text-white rounded-full p-1 text-xs">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    // Add delete functionality
    const deleteBtn = element.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteImage(image.id);
    });

    return element;
  }

  deleteImage(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    const existingImages = JSON.parse(localStorage.getItem('cityExperts_images') || '[]');
    const filteredImages = existingImages.filter(img => img.id !== imageId);
    localStorage.setItem('cityExperts_images', JSON.stringify(filteredImages));
    
    this.loadExistingImages();
    this.showNotification('Image deleted successfully.', 'success');
  }

  filterImages(type, value) {
    // Implementation for filtering existing images
    console.log(`Filtering by ${type}: ${value}`);
  }

  searchImages(query) {
    // Implementation for searching images
    console.log(`Searching for: ${query}`);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
      type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
      'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center">
        <span>${message}</span>
        <button class="ml-4 text-current hover:opacity-70" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }
}

// Initialize the admin portal
document.addEventListener('DOMContentLoaded', () => {
  console.log('🛠️ City Experts Admin Portal Initializing...');
  
  const imageManager = new ImageManager();
  
  console.log('✅ Admin Portal Ready');
});

// Export for external use
export default ImageManager;
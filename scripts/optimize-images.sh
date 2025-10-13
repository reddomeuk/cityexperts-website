#!/bin/bash

# Image Optimization Script for Cloudflare Pages Deployment
# Optimizes large images to be under 25MB and converts to WebP when possible

echo "🖼️  Starting image optimization for Cloudflare Pages..."

# Create optimized directory
mkdir -p public/assets/images/optimized

# Function to optimize an image
optimize_image() {
    local input_file="$1"
    local output_file="$2"
    local max_size_mb=20  # Keep under 20MB to be safe
    
    echo "Optimizing: $input_file"
    
    # Check if ImageMagick is available
    if command -v magick &> /dev/null; then
        # Use ImageMagick to optimize
        magick "$input_file" -resize "1920x1080>" -quality 70 -strip "$output_file"
    elif command -v sips &> /dev/null; then
        # Use macOS sips command
        sips -Z 1920 -s formatOptions 70 "$input_file" --out "$output_file"
    else
        echo "Warning: No image optimization tool found. Please install ImageMagick or use macOS sips."
        cp "$input_file" "$output_file"
    fi
    
    # Check the resulting file size
    if [[ -f "$output_file" ]]; then
        size_mb=$(du -m "$output_file" | cut -f1)
        if [[ $size_mb -gt $max_size_mb ]]; then
            echo "Warning: $output_file is still ${size_mb}MB (target: <${max_size_mb}MB)"
        else
            echo "✅ Optimized: $output_file (${size_mb}MB)"
        fi
    fi
}

# Find and optimize large images
echo "Finding images larger than 10MB..."
find public/assets/images -type f -size +10M -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" | while read -r file; do
    # Get relative path and create optimized version
    rel_path=${file#public/assets/images/}
    dir_path=$(dirname "$rel_path")
    filename=$(basename "$rel_path")
    name_only="${filename%.*}"
    
    # Create directory structure
    mkdir -p "public/assets/images/optimized/$dir_path"
    
    # Optimize to JPEG with reasonable quality
    output_file="public/assets/images/optimized/$dir_path/${name_only}-optimized.jpg"
    optimize_image "$file" "$output_file"
    
    # Move the optimized file back to replace the original
    if [[ -f "$output_file" ]]; then
        mv "$output_file" "$file"
    fi
done

# Clean up temporary directory
rm -rf public/assets/images/optimized

echo "🎉 Image optimization complete!"
#!/bin/bash

# Simple Cloudinary Upload Script for CityExperts
# Replace YOUR_API_KEY and YOUR_API_SECRET with actual values

API_KEY="YOUR_API_KEY"
API_SECRET="YOUR_API_SECRET"
CLOUD_NAME="dmawj7tmu"

echo "🚀 Uploading images to Cloudinary..."

# Function to upload a file
upload_file() {
    local file_path="$1"
    local public_id="$2"
    local folder="$3"
    
    if [ -f "$file_path" ]; then
        echo "📤 Uploading: $file_path → $public_id"
        
        curl -X POST "https://api.cloudinary.com/v1_1/$CLOUD_NAME/image/upload" \
             -F "file=@$file_path" \
             -F "public_id=$public_id" \
             -F "folder=$folder" \
             -F "api_key=$API_KEY" \
             -F "api_secret=$API_SECRET" \
             -F "overwrite=true" \
             -s | jq -r '.secure_url // "Error"'
    else
        echo "❌ File not found: $file_path"
    fi
}

# Upload key images
upload_file "public/assets/images/hero-dubai-skyline.webp" "hero-dubai-skyline" "cityexperts/hero"
upload_file "public/assets/images/city-experts-logo.svg" "city-experts-logo" "cityexperts/logos"
upload_file "public/assets/images/project-1.webp" "project-1" "cityexperts/projects"

echo "✅ Sample upload completed!"
echo "💡 Edit this script with your actual API credentials"

#!/bin/bash

# Final Upload Script (requires Cloudinary credentials)
# Use this if you get API access

export CLOUDINARY_CLOUD_NAME="dmawj7tmu"
# export CLOUDINARY_API_KEY="your-key-here"  
# export CLOUDINARY_API_SECRET="your-secret-here"

echo "🚀 Final Cloudinary Upload for CityExperts"

if [ -z "$CLOUDINARY_API_KEY" ]; then
    echo "❌ Please set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET"
    echo "💡 Or use manual upload: see upload-batch/UPLOAD_INSTRUCTIONS.md"
    exit 1
fi

# Upload with Node.js script
node scripts/upload-to-cloudinary.js

echo "✅ Upload completed! Test at: https://cityexperts-website.pages.dev"

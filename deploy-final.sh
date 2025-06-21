#!/bin/bash

# Final Cloud Run Deployment Script
# This version properly handles all special characters in environment variables

set -e

# Configuration
SERVICE_NAME="invoice-reconciliation-app"
REGION="us-central1"

echo "🚀 Starting Cloud Run Deployment..."

# Check prerequisites
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found!"
    exit 1
fi

if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed!"
    exit 1
fi

PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: No project is set. Run 'gcloud config set project PROJECT_ID'"
    exit 1
fi

echo "📋 Project: $PROJECT_ID"
echo "📍 Region: $REGION"
echo "🏷️  Service: $SERVICE_NAME"
echo ""

# Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    firestore.googleapis.com \
    storage.googleapis.com \
    bigquery.googleapis.com \
    --quiet

# Build the React app
echo "📦 Building React application..."
npm run build

# Create environment variables YAML file
echo "🔧 Preparing environment variables..."
ENV_FILE=$(mktemp /tmp/env.XXXXXX.yaml)

# Write header
cat > "$ENV_FILE" << EOF
# Environment variables for Cloud Run deployment
# Generated from .env.local
NODE_ENV: "production"
PORT: "8080"
EOF

# Track added keys to avoid duplicates
ADDED_KEYS="|NODE_ENV|PORT|"

# Read .env.local and append to YAML file
while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ -n "$line" ]] && [[ "$line" == *"="* ]]; then
        # Extract key and value
        key="${line%%=*}"
        value="${line#*=}"
        
        # Trim whitespace from key
        key=$(echo "$key" | xargs)
        
        # Clean up value - remove surrounding quotes
        value="${value#\"}"
        value="${value%\"}"
        value="${value#\'}"
        value="${value%\'}"
        
        # Write to YAML file with proper quoting (skip duplicates)
        if [[ -n "$key" ]] && [[ -n "$value" ]] && [[ "$ADDED_KEYS" != *"|$key|"* ]]; then
            # Use printf to handle special characters
            printf '%s: "%s"\n' "$key" "$value" >> "$ENV_FILE"
            ADDED_KEYS="${ADDED_KEYS}${key}|"
            echo "  ✓ ${key}"
        fi
    fi
done < .env.local

echo ""
echo "☁️  Deploying to Cloud Run..."

# Remove Dockerfile to force buildpack usage
if [ -f "Dockerfile" ]; then
    mv Dockerfile Dockerfile.bak
    echo "📋 Temporarily renamed Dockerfile to use buildpacks instead"
fi

# Deploy with the environment file
if gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --max-instances 10 \
    --min-instances 1 \
    --timeout 300 \
    --env-vars-file "$ENV_FILE"; then
    
    # Clean up temp file
    rm -f "$ENV_FILE"
    
    # Restore Dockerfile if it was moved
    if [ -f "Dockerfile.bak" ]; then
        mv Dockerfile.bak Dockerfile
    fi
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
    
    echo ""
    echo "✅ Deployment successful!"
    echo "🌐 Service URL: $SERVICE_URL"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs:    gcloud run services logs tail $SERVICE_NAME --region $REGION"
    echo "   Update env:   gcloud run services update $SERVICE_NAME --update-env-vars KEY=VALUE --region $REGION"
    echo "   View config:  gcloud run services describe $SERVICE_NAME --region $REGION"
else
    # Clean up temp file on failure
    rm -f "$ENV_FILE"
    
    # Restore Dockerfile if it was moved
    if [ -f "Dockerfile.bak" ]; then
        mv Dockerfile.bak Dockerfile
    fi
    
    echo ""
    echo "❌ Deployment failed!"
    echo "📋 Debug commands:"
    echo "   View builds:  gcloud builds list --limit=5"
    echo "   View logs:    gcloud builds log $(gcloud builds list --limit=1 --format='value(id)')"
    exit 1
fi
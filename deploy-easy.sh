#!/bin/bash

# Easy Cloud Run Deployment Script
# Simplest possible deployment with environment variables from .env.local

set -e

# Configuration
SERVICE_NAME="invoice-reconciliation-app"
REGION="us-central1"

echo "🚀 Deploying to Cloud Run..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found!"
    exit 1
fi

# Build the app
echo "📦 Building React app..."
npm run build

# Read all env vars from .env.local into an array
echo "🔧 Loading environment variables..."
ENV_VARS=()
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ ! "$key" =~ ^# ]] && [[ -n "$key" ]]; then
        # Clean up the value
        value="${value#\"}"
        value="${value%\"}"
        value="${value#\'}"
        value="${value%\'}"
        
        # Add to array
        ENV_VARS+=("--set-env-vars")
        ENV_VARS+=("${key}=${value}")
        echo "  ✓ ${key}"
    fi
done < .env.local

# Add production env vars
ENV_VARS+=("--set-env-vars")
ENV_VARS+=("NODE_ENV=production")
ENV_VARS+=("--set-env-vars")
ENV_VARS+=("PORT=8080")

# Deploy
echo "☁️  Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --max-instances 10 \
    --min-instances 1 \
    --timeout 300 \
    "${ENV_VARS[@]}"

# Get URL
URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo ""
echo "✅ Deployment complete!"
echo "🌐 URL: $URL"
echo ""
echo "📋 View logs: gcloud run services logs tail $SERVICE_NAME --region $REGION"
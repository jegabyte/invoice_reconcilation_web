#!/bin/bash

# Cloud Run Deployment Script
# This script updates the existing Cloud Run service with env vars from .env.local

set -e

# Configuration
SERVICE_NAME="invoice-reconciliation"  # Existing service name
REGION="us-central1"

echo "🚀 Cloud Run Deployment Script"
echo "================================"

# Check prerequisites
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found!"
    exit 1
fi

PROJECT_ID=$(gcloud config get-value project)
echo "📋 Project: $PROJECT_ID"
echo "📍 Region: $REGION"
echo "🏷️  Service: $SERVICE_NAME"
echo ""

# Build the React app
echo "📦 Building React application..."
npm run build

# Create environment variables YAML file
echo "🔧 Preparing environment variables..."
ENV_FILE=$(mktemp /tmp/cloudrun-env.XXXXXX.yaml)

# Write env vars to YAML
cat > "$ENV_FILE" << EOF
NODE_ENV: "production"
PORT: "8080"
EOF

# Track added keys
ADDED_KEYS="|NODE_ENV|PORT|"

# Read .env.local and append to YAML file
while IFS= read -r line || [ -n "$line" ]; do
    if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ -n "$line" ]] && [[ "$line" == *"="* ]]; then
        key="${line%%=*}"
        value="${line#*=}"
        key=$(echo "$key" | xargs)
        value="${value#\"}"
        value="${value%\"}"
        value="${value#\'}"
        value="${value%\'}"
        
        if [[ -n "$key" ]] && [[ -n "$value" ]] && [[ "$ADDED_KEYS" != *"|$key|"* ]]; then
            printf '%s: "%s"\n' "$key" "$value" >> "$ENV_FILE"
            ADDED_KEYS="${ADDED_KEYS}${key}|"
            echo "  ✓ ${key}"
        fi
    fi
done < .env.local

echo ""
echo "☁️  Deploying to Cloud Run..."

# Deploy with source and env vars
if gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --env-vars-file "$ENV_FILE"; then
    
    rm -f "$ENV_FILE"
    
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
    
    echo ""
    echo "✅ Deployment successful!"
    echo "🌐 Service URL: $SERVICE_URL"
    echo ""
    echo "📋 Commands:"
    echo "   View logs:  gcloud run services logs tail $SERVICE_NAME --region $REGION"
    echo "   Update env: gcloud run services update $SERVICE_NAME --update-env-vars KEY=VALUE --region $REGION"
else
    rm -f "$ENV_FILE"
    echo "❌ Deployment failed!"
    exit 1
fi
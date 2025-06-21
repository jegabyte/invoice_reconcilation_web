#!/bin/bash

# Update Environment Variables on Cloud Run
# This script updates env vars without rebuilding

set -e

# Configuration
SERVICE_NAME="invoice-reconciliation"
REGION="us-central1"

echo "🔧 Updating Cloud Run Environment Variables"
echo "==========================================="

# Check prerequisites
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found!"
    exit 1
fi

echo "📋 Service: $SERVICE_NAME"
echo "📍 Region: $REGION"
echo ""

# Build env vars string
echo "📝 Reading environment variables from .env.local..."
ENV_VARS="NODE_ENV=production,PORT=8080"
ADDED_KEYS="|NODE_ENV|PORT|"

# Read .env.local
while IFS= read -r line || [ -n "$line" ]; do
    if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ -n "$line" ]] && [[ "$line" == *"="* ]]; then
        key="${line%%=*}"
        value="${line#*=}"
        key=$(echo "$key" | xargs)
        
        # Clean value
        value="${value#\"}"
        value="${value%\"}"
        value="${value#\'}"
        value="${value%\'}"
        
        if [[ -n "$key" ]] && [[ -n "$value" ]] && [[ "$ADDED_KEYS" != *"|$key|"* ]]; then
            # Escape special characters for shell
            value=$(printf '%q' "$value")
            ENV_VARS="${ENV_VARS},${key}=${value}"
            ADDED_KEYS="${ADDED_KEYS}${key}|"
            echo "  ✓ ${key}"
        fi
    fi
done < .env.local

echo ""
echo "☁️  Updating Cloud Run service..."

# Update the service with new env vars
if gcloud run services update $SERVICE_NAME \
    --region $REGION \
    --set-env-vars "$ENV_VARS"; then
    
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
    
    echo ""
    echo "✅ Environment variables updated successfully!"
    echo "🌐 Service URL: $SERVICE_URL"
    echo ""
    echo "📋 Note: The application code was NOT updated, only environment variables."
    echo "   To deploy new code, use: gcloud run deploy $SERVICE_NAME --source . --region $REGION"
else
    echo "❌ Update failed!"
    exit 1
fi
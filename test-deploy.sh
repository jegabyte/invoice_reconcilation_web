#!/bin/bash

# Test deployment with minimal configuration

echo "🧪 Testing minimal Cloud Run deployment..."

# Build first
echo "📦 Building app..."
npm run build

# Deploy with just the basics
echo "☁️  Deploying..."
gcloud run deploy invoice-reconciliation-app \
    --source . \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars NODE_ENV=production,PORT=8080,GCP_PROJECT_ID=aiva-e74f3

echo "✅ Done"
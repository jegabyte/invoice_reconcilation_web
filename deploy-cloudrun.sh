#!/bin/bash

# Simple Cloud Run Deployment
# Deploys to existing service: invoice-reconciliation

echo "🚀 Cloud Run Deployment"
echo "======================="
echo ""

# Build the app
echo "📦 Building React app..."
npm run build

# Show existing service info
echo ""
echo "📋 Current Service Info:"
gcloud run services describe invoice-reconciliation --region us-central1 --format="table(metadata.name,spec.template.spec.containers[0].image,status.url)" 2>/dev/null || true

echo ""
echo "☁️  Deploying to Cloud Run..."
echo "   This will update the code but NOT the environment variables"
echo ""

# Deploy (without env vars to avoid parsing issues)
gcloud run deploy invoice-reconciliation \
    --source . \
    --region us-central1 \
    --quiet

# Get URL
URL=$(gcloud run services describe invoice-reconciliation --region us-central1 --format 'value(status.url)')

echo ""
echo "✅ Deployment complete!"
echo "🌐 URL: $URL"
echo ""
echo "⚠️  Note: Environment variables were NOT updated due to special characters."
echo "   To update env vars manually, use:"
echo "   gcloud run services update invoice-reconciliation --region us-central1 --update-env-vars KEY=VALUE"
echo ""
echo "📋 View logs:"
echo "   gcloud run services logs tail invoice-reconciliation --region us-central1"
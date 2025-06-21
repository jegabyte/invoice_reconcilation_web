#!/bin/bash

# Deploy Latest Code to Cloud Run

echo "🚀 Deploying Latest Code to Cloud Run"
echo "====================================="

# Build first
echo "📦 Building app..."
npm run build

# Clear any Docker cache
echo "🧹 Clearing build cache..."
gcloud config set builds/use_kaniko True

# Deploy with timestamp to force rebuild
TIMESTAMP=$(date +%s)
echo "☁️  Deploying (timestamp: $TIMESTAMP)..."

gcloud run deploy invoice-reconciliation \
    --source . \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars "_BUILD_ID=${TIMESTAMP}"

echo ""
echo "✅ Done! Your app should now be accessible at:"
echo "   https://invoice-reconciliation-puql6kbaxq-uc.a.run.app"
echo ""
echo "Test it with:"
echo "   curl https://invoice-reconciliation-puql6kbaxq-uc.a.run.app/"
#!/bin/bash

# Force Deploy to Cloud Run (bypasses cache)

set -e

SERVICE_NAME="invoice-reconciliation"
REGION="us-central1"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "🚀 Force Deploy to Cloud Run"
echo "============================"
echo "Timestamp: $TIMESTAMP"
echo ""

# Build the app
echo "📦 Building React app..."
npm run build

# Get current git commit or use timestamp
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo $TIMESTAMP)

echo ""
echo "☁️  Deploying to Cloud Run (forcing new build)..."
echo "   Service: $SERVICE_NAME"
echo "   Region: $REGION"
echo "   Tag: $GIT_COMMIT"
echo ""

# Deploy with --tag to force new revision
gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --tag "deploy-${TIMESTAMP}" \
    --no-traffic

# If deployment succeeds, route traffic to new revision
if [ $? -eq 0 ]; then
    echo ""
    echo "🔄 Routing traffic to new revision..."
    
    # Get the new revision name
    NEW_REVISION=$(gcloud run revisions list \
        --service $SERVICE_NAME \
        --region $REGION \
        --format="value(name)" \
        --limit=1)
    
    # Route 100% traffic to new revision
    gcloud run services update-traffic $SERVICE_NAME \
        --region $REGION \
        --to-latest
    
    echo ""
    echo "✅ Deployment complete!"
    
    # Get URL
    URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
    echo "🌐 URL: $URL"
    echo "📋 New revision: $NEW_REVISION"
    echo ""
    echo "To view logs:"
    echo "  gcloud run services logs tail $SERVICE_NAME --region $REGION"
else
    echo "❌ Deployment failed!"
    exit 1
fi
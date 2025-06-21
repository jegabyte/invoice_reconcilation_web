#!/bin/bash

# Cloud Run Status Script

echo "🔍 Cloud Run Service Status"
echo "=========================="
echo ""

SERVICE_NAME="invoice-reconciliation"
REGION="us-central1"

# Get service details
echo "📋 Service Details:"
gcloud run services describe $SERVICE_NAME --region $REGION --format="table(
  status.latestReadyRevisionName:label='Latest Revision',
  status.url:label='URL',
  spec.template.spec.containers[0].image:label='Image'
)" 2>/dev/null

echo ""
echo "🔧 Current Environment Variables:"
gcloud run services describe $SERVICE_NAME --region $REGION --format="value(spec.template.spec.containers[0].env[].name)" 2>/dev/null | head -10
echo "... (showing first 10)"

echo ""
echo "📊 Traffic Allocation:"
gcloud run services describe $SERVICE_NAME --region $REGION --format="table(
  status.traffic[].revisionName:label='Revision',
  status.traffic[].percent:label='Traffic %'
)" 2>/dev/null

echo ""
echo "✅ Your app is deployed at:"
URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)" 2>/dev/null)
echo "   $URL"

echo ""
echo "📝 Useful Commands:"
echo "   View logs:        gcloud run services logs tail $SERVICE_NAME --region $REGION"
echo "   Update env var:   gcloud run services update $SERVICE_NAME --region $REGION --update-env-vars KEY=VALUE"
echo "   Deploy new code:  ./deploy-cloudrun.sh"
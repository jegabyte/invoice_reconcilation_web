# Cloud Run Deployment Guide

This guide covers deploying the Invoice Reconciliation Application to Google Cloud Run.

## Prerequisites

1. **Google Cloud Project**
   - Active GCP project with billing enabled
   - Project ID set in environment variables

2. **APIs to Enable**
   ```bash
   gcloud services enable \
     run.googleapis.com \
     cloudbuild.googleapis.com \
     firestore.googleapis.com \
     storage.googleapis.com \
     bigquery.googleapis.com \
     secretmanager.googleapis.com
   ```

3. **Service Account Permissions**
   The Cloud Run service account needs these roles:
   - `roles/datastore.user` (Firestore access)
   - `roles/storage.objectAdmin` (Cloud Storage access)
   - `roles/bigquery.dataViewer` (BigQuery access)
   - `roles/secretmanager.secretAccessor` (Secret Manager access)

## Environment Variables Setup

### Option 1: Using Secret Manager (Recommended)

1. Create secrets in Secret Manager:
   ```bash
   # Create each secret
   echo -n "your-project-id" | gcloud secrets create GCP_PROJECT_ID --data-file=-
   echo -n "your-database-id" | gcloud secrets create FIRESTORE_DATABASE_ID --data-file=-
   echo -n "your-bucket-name" | gcloud secrets create GCS_BUCKET_NAME --data-file=-
   echo -n "true" | gcloud secrets create USE_BIGQUERY_FOR_INVOICES --data-file=-
   echo -n "recon_summary" | gcloud secrets create BIGQUERY_DATASET --data-file=-
   echo -n "invoice_review" | gcloud secrets create BIGQUERY_TABLE_INVOICE_REVIEW --data-file=-
   ```

2. Grant Cloud Run access to secrets:
   ```bash
   gcloud secrets add-iam-policy-binding GCP_PROJECT_ID \
     --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

### Option 2: Using Environment Variables File

Create a `.env.yaml` file (don't commit this):
```yaml
env_variables:
  GCP_PROJECT_ID: "your-project-id"
  FIRESTORE_DATABASE_ID: "(default)"
  GCS_BUCKET_NAME: "your-bucket-name"
  STORAGE_BUCKET_NAME: "your-bucket-name"
  STORAGE_UPLOAD_PATH: "pending"
  USE_BIGQUERY_FOR_INVOICES: "true"
  BIGQUERY_DATASET: "recon_summary"
  BIGQUERY_TABLE_INVOICE_REVIEW: "invoice_review"
  NODE_ENV: "production"
```

## Deployment Methods

### Method 1: Direct Deployment with gcloud CLI

1. **Build and Deploy in One Command**:
   ```bash
   # Deploy with source code (Cloud Build will build the Docker image)
   gcloud run deploy invoice-reconciliation-app \
     --source . \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated \
     --memory 2Gi \
     --cpu 2 \
     --timeout 300 \
     --max-instances 10 \
     --min-instances 1 \
     --env-vars-file .env.yaml
   ```

2. **Deploy with Secret Manager**:
   ```bash
   gcloud run deploy invoice-reconciliation-app \
     --source . \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated \
     --memory 2Gi \
     --cpu 2 \
     --timeout 300 \
     --max-instances 10 \
     --min-instances 1 \
     --set-secrets="GCP_PROJECT_ID=GCP_PROJECT_ID:latest,FIRESTORE_DATABASE_ID=FIRESTORE_DATABASE_ID:latest,GCS_BUCKET_NAME=GCS_BUCKET_NAME:latest,USE_BIGQUERY_FOR_INVOICES=USE_BIGQUERY_FOR_INVOICES:latest,BIGQUERY_DATASET=BIGQUERY_DATASET:latest,BIGQUERY_TABLE_INVOICE_REVIEW=BIGQUERY_TABLE_INVOICE_REVIEW:latest"
   ```

### Method 2: Using Cloud Build

1. **Trigger Cloud Build**:
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

2. **Set up Continuous Deployment** (from GitHub):
   ```bash
   gcloud run services set-iam-policy invoice-reconciliation-app \
     --region=us-central1 \
     --member="allUsers" \
     --role="roles/run.invoker"
   ```

### Method 3: Using Docker

1. **Build and Push Docker Image**:
   ```bash
   # Build image
   docker build -t gcr.io/$GCP_PROJECT_ID/invoice-reconciliation-app .
   
   # Configure Docker for GCR
   gcloud auth configure-docker
   
   # Push image
   docker push gcr.io/$GCP_PROJECT_ID/invoice-reconciliation-app
   ```

2. **Deploy from Container Image**:
   ```bash
   gcloud run deploy invoice-reconciliation-app \
     --image gcr.io/$GCP_PROJECT_ID/invoice-reconciliation-app \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated \
     --memory 2Gi \
     --cpu 2 \
     --timeout 300 \
     --max-instances 10 \
     --min-instances 1 \
     --env-vars-file .env.yaml
   ```

## Post-Deployment Configuration

1. **Update Frontend Environment**:
   After deployment, update your frontend to use the Cloud Run URL:
   ```bash
   # Get the service URL
   gcloud run services describe invoice-reconciliation-app --region us-central1 --format 'value(status.url)'
   ```

2. **Configure CORS** (if needed):
   Update `server.js` to allow your frontend domain:
   ```javascript
   app.use(cors({
     origin: ['https://your-frontend-domain.com'],
     credentials: true
   }));
   ```

3. **Set up Custom Domain** (optional):
   ```bash
   gcloud run domain-mappings create \
     --service invoice-reconciliation-app \
     --domain your-domain.com \
     --region us-central1
   ```

## Monitoring and Debugging

1. **View Logs**:
   ```bash
   gcloud run services logs read invoice-reconciliation-app --region us-central1
   ```

2. **View Real-time Logs**:
   ```bash
   gcloud run services logs tail invoice-reconciliation-app --region us-central1
   ```

3. **Check Service Status**:
   ```bash
   gcloud run services describe invoice-reconciliation-app --region us-central1
   ```

## Rollback

To rollback to a previous revision:
```bash
# List revisions
gcloud run revisions list --service invoice-reconciliation-app --region us-central1

# Rollback to specific revision
gcloud run services update-traffic invoice-reconciliation-app \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```

## Cost Optimization

1. **Set Concurrency**:
   ```bash
   --concurrency 80
   ```

2. **Use Minimum Instances Wisely**:
   - Set to 0 for dev/staging
   - Set to 1-2 for production to avoid cold starts

3. **Configure CPU Allocation**:
   ```bash
   --cpu-throttling    # CPU only allocated during requests
   --no-cpu-throttling # CPU always allocated (for background tasks)
   ```

## Security Best Practices

1. **Use Secret Manager** for sensitive data
2. **Enable Cloud Armor** for DDoS protection
3. **Set up Identity Platform** for authentication
4. **Use VPC Connector** for private resources
5. **Enable Binary Authorization** for container security

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Ensure service account has correct permissions
   - Check if APIs are enabled

2. **Build Failures**:
   - Check `package.json` scripts
   - Verify Node.js version in Dockerfile

3. **Runtime Errors**:
   - Check environment variables
   - Review Cloud Run logs
   - Verify Firestore/BigQuery permissions

4. **Cold Start Issues**:
   - Increase minimum instances
   - Optimize application startup time
   - Use lighter dependencies

### Debug Commands

```bash
# Test locally with Cloud Run emulator
docker build -t invoice-app .
PORT=8080 docker run -p 8080:8080 invoice-app

# Check service configuration
gcloud run services describe invoice-reconciliation-app --region us-central1 --format yaml

# Update specific environment variable
gcloud run services update invoice-reconciliation-app \
  --update-env-vars KEY=VALUE \
  --region us-central1
```
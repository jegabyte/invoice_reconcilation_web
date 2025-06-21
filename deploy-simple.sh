#!/bin/bash

# Simple Cloud Run Deployment Script
# This script reads .env.local and deploys with those environment variables

set -e  # Exit on error

# Configuration
SERVICE_NAME="invoice-reconciliation-app"
REGION="us-central1"
MEMORY="2Gi"
CPU="2"
MAX_INSTANCES="10"
MIN_INSTANCES="1"
TIMEOUT="300"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_error ".env.local not found!"
    exit 1
fi

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    print_error "No project is set. Please run 'gcloud config set project PROJECT_ID'"
    exit 1
fi

print_status "Deploying to project: $PROJECT_ID"

# Read .env.local and convert to Cloud Run format
print_status "Reading environment variables from .env.local..."

# Create a temporary file for environment variables
ENV_FILE=$(mktemp)
echo "NODE_ENV: production" > "$ENV_FILE"

print_status "Creating environment variables file..."

# Track added keys to avoid duplicates
ADDED_KEYS=""

# Read .env.local and write to yaml format
while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ -n "$line" ]] && [[ "$line" == *"="* ]]; then
        # Extract key and value
        key="${line%%=*}"
        value="${line#*=}"
        
        # Trim whitespace from key
        key=$(echo "$key" | xargs)
        
        # Remove quotes from value if present
        value="${value#\"}"
        value="${value%\"}"
        value="${value#\'}"
        value="${value%\'}"
        
        # Skip if key or value is empty or already added
        if [[ -n "$key" ]] && [[ -n "$value" ]]; then
            # Check if key was already added
            if [[ "$ADDED_KEYS" != *"|$key|"* ]]; then
                # Write to temp file in YAML format
                echo "${key}: \"${value}\"" >> "$ENV_FILE"
                ADDED_KEYS="${ADDED_KEYS}|${key}|"
                
                print_status "  Added: ${key}"
            fi
        fi
    fi
done < .env.local

# Show the env file for debugging
print_status "Environment variables file created at: $ENV_FILE"
print_status "Contents:"
cat "$ENV_FILE"

# Enable required APIs
print_status "Enabling required APIs..."
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    firestore.googleapis.com \
    storage.googleapis.com \
    bigquery.googleapis.com \
    --quiet

# Build the application
print_status "Building React application..."
npm run build

# Deploy to Cloud Run with environment variables
print_status "Deploying to Cloud Run with environment variables from .env.local..."

# Add a delay to ensure env file is written
sleep 1

# Deploy
if gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --memory $MEMORY \
    --cpu $CPU \
    --timeout $TIMEOUT \
    --max-instances $MAX_INSTANCES \
    --min-instances $MIN_INSTANCES \
    --env-vars-file "$ENV_FILE"; then
    
    # Clean up temp file
    rm -f "$ENV_FILE"
else
    print_error "Deployment failed. Check the logs above for details."
    print_status "To view build logs, run:"
    echo "  gcloud builds list --limit=5"
    
    # Clean up temp file
    rm -f "$ENV_FILE"
    exit 1
fi

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

if [ -z "$SERVICE_URL" ]; then
    print_error "Failed to get service URL"
    exit 1
fi

print_status "Deployment successful!"
print_status "Service URL: $SERVICE_URL"

# Show deployment info
print_status "Deployment Summary:"
echo "  Service: $SERVICE_NAME"
echo "  Region: $REGION"
echo "  URL: $SERVICE_URL"
echo "  Memory: $MEMORY"
echo "  CPU: $CPU"
echo "  Min Instances: $MIN_INSTANCES"
echo "  Max Instances: $MAX_INSTANCES"

print_status "Environment variables from .env.local have been set in Cloud Run"

print_status "To view logs, run:"
echo "  gcloud run services logs tail $SERVICE_NAME --region $REGION"

print_status "To update a single environment variable, run:"
echo "  gcloud run services update $SERVICE_NAME --update-env-vars KEY=VALUE --region $REGION"
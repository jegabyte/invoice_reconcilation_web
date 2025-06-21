#!/bin/bash

# Direct Cloud Run Deployment Script (No Docker)
# This script deploys using buildpacks instead of Dockerfile

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

print_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
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

# Create a Procfile for buildpacks
print_status "Creating Procfile for deployment..."
echo "web: node server.js" > Procfile

# Read environment variables from .env.local and build the string
print_status "Reading environment variables from .env.local..."
ENV_VARS=""
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
        
        # Escape special characters
        value=$(printf '%s' "$value" | sed 's/[[\.*^$()+?{|]/\\&/g')
        
        # Skip if key or value is empty
        if [[ -n "$key" ]] && [[ -n "$value" ]]; then
            if [ -z "$ENV_VARS" ]; then
                ENV_VARS="${key}=${value}"
            else
                ENV_VARS="${ENV_VARS},${key}=${value}"
            fi
            print_status "  Added: ${key}"
        fi
    fi
done < .env.local

# Add NODE_ENV=production and PORT
ENV_VARS="${ENV_VARS},NODE_ENV=production,PORT=8080"

# Deploy to Cloud Run using buildpacks
print_status "Deploying to Cloud Run using Google Cloud Buildpacks..."

# Create a temporary .gcloudignore to include necessary files
cat > .gcloudignore.tmp << EOF
# Include everything needed for deployment
!dist/
!server.js
!api/
!package.json
!package-lock.json
!Procfile

# Exclude development files
node_modules/
.git/
.gitignore
*.log
.env.local
.env.development
*.md
.vscode/
.idea/
.DS_Store
coverage/
*.backup
src/
public/
index.html
vite.config.ts
tsconfig.json
tailwind.config.js
postcss.config.js
EOF

# Move original .gcloudignore if it exists
if [ -f ".gcloudignore" ]; then
    mv .gcloudignore .gcloudignore.bak
fi
mv .gcloudignore.tmp .gcloudignore

# Deploy with buildpacks
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
    --set-env-vars "${ENV_VARS}" \
    --no-use-default-service-account; then
    
    print_status "Deployment successful!"
else
    print_error "Deployment failed."
    # Restore original .gcloudignore
    if [ -f ".gcloudignore.bak" ]; then
        mv .gcloudignore.bak .gcloudignore
    else
        rm -f .gcloudignore
    fi
    rm -f Procfile
    exit 1
fi

# Restore original .gcloudignore
if [ -f ".gcloudignore.bak" ]; then
    mv .gcloudignore.bak .gcloudignore
else
    rm -f .gcloudignore
fi

# Clean up Procfile
rm -f Procfile

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

if [ -z "$SERVICE_URL" ]; then
    print_error "Failed to get service URL"
    exit 1
fi

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

print_status "To view logs, run:"
echo "  gcloud run services logs tail $SERVICE_NAME --region $REGION"

print_status "To update a single environment variable, run:"
echo "  gcloud run services update $SERVICE_NAME --update-env-vars KEY=VALUE --region $REGION"
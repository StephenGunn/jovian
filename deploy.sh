#!/bin/bash

# Source and export specific variables from .env
export CLOUDFLARE_ACCOUNT_ID=$(grep ^CLOUDFLARE_ACCOUNT_ID .env | cut -d '=' -f2)
export CLOUDFLARE_API_TOKEN=$(grep ^CLOUDFLARE_API_TOKEN .env | cut -d '=' -f2)
export PARTYKIT_DOMAIN=$(grep ^PARTYKIT_DOMAIN .env | cut -d '=' -f2 || echo "partykit.domain.com")

# Check if required variables are set and not empty
if [ -z "$CLOUDFLARE_ACCOUNT_ID" ] || [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "Error: Missing required environment variables in .env"
    echo "Please ensure CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are set"
    exit 1
fi

# Print confirmation of loaded variables (optional, remove in production)
echo "Using account ID: $CLOUDFLARE_ACCOUNT_ID"
echo "Using domain: $PARTYKIT_DOMAIN"

# Run the deploy command
npx partykit deploy --domain $PARTYKIT_DOMAIN

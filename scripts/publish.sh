#!/usr/bin/env bash
set -euo pipefail

REGISTRY=${1:-${REGISTRY_URL:-}}
IMAGE=${2:-bobrossbot}
TAG=${3:-${GITHUB_SHA:-latest}}

if [ -z "$REGISTRY" ]; then
  echo "Usage: $0 <registry> [image] [tag]" >&2
  exit 2
fi

FULL_IMAGE="$REGISTRY/$IMAGE:$TAG"

echo "Building image $FULL_IMAGE"
docker build -t "$FULL_IMAGE" .

echo "Pushing image"
docker push "$FULL_IMAGE"

echo "Published $FULL_IMAGE"

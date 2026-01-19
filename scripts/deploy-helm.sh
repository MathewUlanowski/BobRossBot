#!/usr/bin/env bash
set -euo pipefail

RELEASE=${1:-bobrossbot}
NAMESPACE=${2:-bobrossbot}
IMAGE=${3:-ghcr.io/MathewUlanowski/bobrossbot}
TAG=${4:-latest}

if [ -z "$IMAGE" ]; then
  echo "Usage: $0 [release] [namespace] <image_repo> [image_tag]" >&2
  exit 2
fi

helm upgrade --install "$RELEASE" ./helm --namespace "$NAMESPACE" --create-namespace \
  --set image.repository="$IMAGE" --set image.tag="$TAG" \
  --atomic --wait --timeout 5m

echo "Deployed $RELEASE to namespace $NAMESPACE with image $IMAGE:$TAG"

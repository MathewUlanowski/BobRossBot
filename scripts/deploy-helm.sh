#!/usr/bin/env bash
set -euo pipefail

NAMESPACE=${1:-bobrossbot}
RELEASE=${2:-bobrossbot}
IMAGE_REPO=${3:-${IMAGE_REPOSITORY:-}}
IMAGE_TAG=${4:-${IMAGE_TAG:-latest}}

if [ -z "$IMAGE_REPO" ]; then
  echo "Usage: $0 [namespace] [release] <image_repo> [image_tag]" >&2
  exit 2
fi

helm upgrade --install "$RELEASE" ./helm --namespace "$NAMESPACE" \
  --set image.repository="$IMAGE_REPO" --set image.tag="$IMAGE_TAG" --wait

echo "Deployed $RELEASE to namespace $NAMESPACE with image $IMAGE_REPO:$IMAGE_TAG"

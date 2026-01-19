#!/usr/bin/env bash
set -euo pipefail

CHART_DIR="helm"
VALUES_FILE="helm/values.staging.yaml"

out=$(mktemp)
helm template "$CHART_DIR" --values "$VALUES_FILE" > "$out"

if ! grep -q "readinessProbe:" "$out"; then
  echo "ERROR: rendered templates missing readinessProbe"
  exit 2
fi

if ! grep -q "livenessProbe:" "$out"; then
  echo "ERROR: rendered templates missing livenessProbe"
  exit 3
fi

if ! grep -q "resources:" "$out"; then
  echo "ERROR: rendered templates missing resources"
  exit 4
fi

echo "Helm template verification passed: probes and resources present"
rm -f "$out"

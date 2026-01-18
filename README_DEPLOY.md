Bob Ross Bot — Build & Deploy to Kubernetes

Overview
- This repository contains a Node.js + TypeScript Discord bot that uses OpenAI to respond like Bob ross.
- A `Dockerfile`, `k8s/` manifests, and a `helm/` chart are provided to deploy to Kubernetes.

Prerequisites
- Docker installed and logged into your container registry.
- kubectl configured to point at your cluster.
- helm installed (v3+).
- A namespace for the bot (recommended: `bobrossbot`).

1) Build and push the Docker image

Use the included script (recommended):

```bash
# Local usage
./scripts/publish.sh <REGISTRY> bobrossbot latest

# CI usage (example):
# ./scripts/publish.sh ${{ secrets.REGISTRY_URL }} bobrossbot ${{ github.sha }}
```

Or run manually:
```bash
docker build -t <REGISTRY>/bobrossbot:latest .
docker push <REGISTRY>/bobrossbot:latest
```

2) Create namespace and secrets (recommended)
```bash
kubectl create namespace bobrossbot
# Create k8s secret from your .env file (do this carefully on production - consider SealedSecrets or external secret store)
kubectl create secret generic bobrossbot-secrets --from-env-file=.env -n bobrossbot
```

Production deployment notes:
- Deploy to a new `bobrossbot` namespace to isolate from your MC server.
- Prefer a rolling deployment with a small replica count initially and monitor resource usage.
- Use Helm's `--set image.repository` and `--set image.tag` to point to the CI-built image tag (we push images as `<REGISTRY>/bobrossbot:${{ github.sha }}` in CI).
- If your cluster is shared with the MC server, schedule the deployment during a low-traffic window and ensure resource requests/limits are conservative to avoid contention.
- For secrets in production, prefer sealed secrets or the External Secrets Operator over committing values to Helm charts or repo.

3) Deploy with Helm
```bash
helm upgrade --install bobrossbot ./helm --namespace bobrossbot \
  --set image.repository=<REGISTRY>/bobrossbot --set image.tag=latest
```

Notes
- The Helm chart contains a `secret` template that will create a Secret from `values.yaml`. For production, prefer creating secrets outside Helm or using sealed secrets/vault.
- If your registry requires credentials, create an image pull secret and add its name to `imagePullSecrets` in `helm/values.yaml` or pass via `--set imagePullSecrets={my-secret}`.
- The slash command will be registered on startup. For testing, set `GUILD_ID` in your `.env` to register immediately in that guild.

Troubleshooting
- If the bot fails due to OpenAI quota, check your OpenAI billing and usage.
- Check logs with:
```bash
kubectl logs -l app=bobrossbot -n bobrossbot
```

If you want, I can build and push the image from here if you provide registry credentials or a registry that allows anonymous push. Otherwise run the commands above on your machine or CI.

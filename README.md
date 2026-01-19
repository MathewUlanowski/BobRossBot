# Bob Ross Bot 2.0

A Discord bot that responds like Bob Ross using OpenAI's GPT API.

## Prerequisites

- Docker (Docker Desktop or another container runtime)
- Node.js (LTS, e.g., 18+)
- npm
- (For Helm deployment) Helm v3+ and `kubectl`
- A Kubernetes cluster (minikube, kind, or a cluster you have access to)

---

## Running locally (development) 

**Preferred (one-liner):** run the helper script:

```powershell
.\local-start.ps1
```

**Optional (manual two-step):**

```bash
# 1) Build the local image
docker build -t bobrossbot:latest .
```

```powershell
# 2) Deploy with Helm
helm upgrade --install bobross-bot ./helm `
  -f ./helm/values.local.yaml `
  --namespace bobross-bot-ns `
  --create-namespace
```

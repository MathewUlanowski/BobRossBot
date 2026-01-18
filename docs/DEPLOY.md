# Deploy / Kubeconfig setup (Windows PowerShell)

This document shows a minimal, safe way to give GitHub Actions a kubeconfig with least privilege for deploying the Helm chart to the `bobrossbot` namespace.

## 1) Create namespace + ServiceAccount + Role/RoleBinding
Apply the included manifest to create the namespace and `gh-actions-deployer` ServiceAccount with a namespace-scoped Role:

```bash
kubectl apply -f k8s/deployer-sa.yaml
```

## 2) Extract a ServiceAccount token
Preferred (kubectl >= 1.24):

```powershell
$Namespace = "bobrossbot"
$SA = "gh-actions-deployer"
$token = kubectl create token $SA -n $Namespace
```

Fallback (older clusters):

```powershell
$Namespace = "bobrossbot"
$SA = "gh-actions-deployer"
$secretName = kubectl get sa $SA -n $Namespace -o jsonpath="{.secrets[0].name}"
$tokenBase64 = kubectl get secret $secretName -n $Namespace -o jsonpath="{.data.token}"
$token = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($tokenBase64))
```

## 3) Build a minimal kubeconfig (PowerShell, uses $env:USERPROFILE)
This creates a kubeconfig file that uses the SA token and the current cluster information from your existing kubeconfig.

```powershell
$Namespace = "bobrossbot"
$SA = "gh-actions-deployer"
$OutKube = Join-Path $env:USERPROFILE "sa-kubeconfig.yaml"

# Get cluster/context info from current kubeconfig
$context = kubectl config current-context
$cluster = kubectl config view -o jsonpath="{.contexts[?(@.name=='$context')].context.cluster}"
$server = kubectl config view -o jsonpath="{.clusters[?(@.name=='$cluster')].cluster.server}"
$caData = kubectl config view -o jsonpath="{.clusters[?(@.name=='$cluster')].cluster.certificate-authority-data}"

# Write CA to a file
$caFile = Join-Path $env:USERPROFILE "sa-ca.crt"
[System.IO.File]::WriteAllBytes($caFile, [System.Convert]::FromBase64String($caData))

# Create a new kubeconfig referencing the CA file and the SA token
kubectl config --kubeconfig=$OutKube set-cluster gh-actions-cluster --server=$server --certificate-authority=$caFile --embed-certs=true
kubectl config --kubeconfig=$OutKube set-credentials $SA --token=$token
kubectl config --kubeconfig=$OutKube set-context default --cluster=gh-actions-cluster --user=$SA --namespace=$Namespace
kubectl config --kubeconfig=$OutKube use-context default

Write-Host "Wrote kubeconfig to $OutKube (remove local copies after creating secret)"
```

## 4) Set the secret in GitHub Actions
Encode the kubeconfig file and set it as the `KUBE_CONFIG` repository secret for Actions (uses `gh` CLI):

```powershell
$KubeFile = Join-Path $env:USERPROFILE "sa-kubeconfig.yaml"
$base64 = [System.Convert]::ToBase64String([System.IO.File]::ReadAllBytes($KubeFile))
# Replace the -R value with the correct repo if needed
gh secret set KUBE_CONFIG --body $base64 -R MathewUlanowski/BobRossBot

# Optional: securely remove local files
Remove-Item $KubeFile; Remove-Item $caFile
```

## 5) Quick: deploy directly from your Windows machine to Hetzner (one-liner)
I added `scripts/deploy-hetzner.ps1` which simplifies manual deploys. Example usage (PowerShell):

```powershell
# Build/push image to GHCR and deploy
.\scripts\deploy-hetzner.ps1 -Host "5.161.236.185" -User root -PushImage

# Deploy using an existing image tag (no push)
.\scripts\deploy-hetzner.ps1 -Host "5.161.236.185" -User root -ImageTag "v1234"
```

Prerequisites:
- `gh` CLI authenticated (if using -PushImage)
- `docker` installed and able to push to GHCR (if using -PushImage)
- Remote server has `helm` and `kubectl` installed and the `root` (or given user) can run them
- SSH key access to the server (default: `%USERPROFILE%\.ssh\id_ed25519`)

If you'd like, I can also add an interactive PowerShell wrapper that prompts for missing values and verifies remote tools before running. Let me know and I'll add it to `scripts/`.

## Notes & Security
- The ServiceAccount created is namespace-scoped. You can further restrict `rules` in `k8s/deployer-sa.yaml` to tighten permissions.
- Use `kubectl create token` where possible (avoids writing long-lived secrets). If your cluster doesn't support it, the token obtained from the secret behaves similarly.
- Rotate or remove secrets if you suspect exposure.

---
If you want, I can also automate these steps with a short PowerShell script added to `scripts/` and a `README` example to test the deploy step from your machine. Want me to add that script and a PR? (I can just add it directly.)
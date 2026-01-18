<#
.SYNOPSIS
  Deploy the Helm chart to a remote Hetzner host via SSH. Intended for local manual deploys from Windows PowerShell.

.PARAMETER Host
  Remote host/IP.
.PARAMETER User
  SSH user (default: root).
.PARAMETER SshKey
  Path to SSH private key (default: $env:USERPROFILE\.ssh\id_ed25519).
.PARAMETER ImageRepo
  Full image repository (default: ghcr.io/MathewUlanowski/BobRossBot).
.PARAMETER ImageTag
  Image tag to deploy (default: latest).
.PARAMETER PushImage
  Switch to build and push the Docker image to GHCR before deploying.
#>
param(
  [Parameter(Mandatory=$true)] [string] $Host,
  [string] $User = 'root',
  [string] $SshKey = "$env:USERPROFILE\.ssh\id_ed25519",
  [string] $ImageRepo = 'ghcr.io/MathewUlanowski/BobRossBot',
  [string] $ImageTag = 'latest',
  [switch] $PushImage
)

set -e

Write-Host "Deploying to $User@$Host using image $ImageRepo:$ImageTag"

# Check prerequisites
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { Write-Error "docker not found in PATH"; exit 1 }
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) { Write-Error "scp not found in PATH (install OpenSSH client)"; exit 1 }
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) { Write-Error "ssh not found in PATH (install OpenSSH client)"; exit 1 }
if (-not (Get-Command tar -ErrorAction SilentlyContinue)) { Write-Error "tar not found in PATH"; exit 1 }

# Optional: build and push image
if ($PushImage) {
  Write-Host "Checking GH auth..."
  $gh = Get-Command gh -ErrorAction SilentlyContinue
  if (-not $gh) { Write-Error "gh CLI not found - please 'gh auth login' first or disable -PushImage"; exit 1 }

  Write-Host "Building Docker image..."
  docker build -t "$ImageRepo:$ImageTag" . || { Write-Error "docker build failed"; exit 1 }

  Write-Host "Logging into GHCR (using gh auth)..."
  $token = gh auth token 2>$null
  if (-not $token) {
    Write-Error "Could not obtain GH auth token via 'gh auth token' - run 'gh auth login' and retry"; exit 1
  }
  # Use docker login with token
  $loginProc = "echo $token | docker login ghcr.io -u $($env:GH_USER -or $env:USER) --password-stdin"
  iex $loginProc

  Write-Host "Pushing image $ImageRepo:$ImageTag"
  docker push "$ImageRepo:$ImageTag" || { Write-Error "docker push failed"; exit 1 }
}

# Helm lint locally
if (Get-Command helm -ErrorAction SilentlyContinue) {
  Write-Host "Running helm lint..."
  helm lint ./helm || { Write-Error "helm lint failed"; exit 1 }
} else {
  Write-Warning "helm not found locally; continuing (remote helm must exist)"
}

# Package the chart
Write-Host "Packaging chart..."
if (Test-Path chart.tar.gz) { Remove-Item chart.tar.gz }
# Use tar to create the archive
tar -czf chart.tar.gz helm || { Write-Error "Failed to create chart.tar.gz"; exit 1 }

# Copy to remote
Write-Host "Copying chart to $User@$Host..."
scp -i $SshKey -o StrictHostKeyChecking=yes chart.tar.gz "$User@$Host:~/chart.tar.gz" || { Write-Error "scp failed"; exit 1 }

# Remote commands
$remoteCmd = @"
mkdir -p ~/helm-deploy && tar -xzf ~/chart.tar.gz -C ~/helm-deploy && \
  helm upgrade --install bobrossbot ~/helm-deploy/helm --namespace bobrossbot --create-namespace --set image.repository=$ImageRepo --set image.tag=$ImageTag --atomic --wait --timeout 5m && \
  rm -rf ~/chart.tar.gz ~/helm-deploy
"@

Write-Host "Running remote helm upgrade..."
ssh -i $SshKey -o StrictHostKeyChecking=yes "$User@$Host" $remoteCmd || { Write-Error "Remote deploy failed"; exit 1 }

Write-Host "Deploy finished. Check pods:"
ssh -i $SshKey -o StrictHostKeyChecking=yes "$User@$Host" "kubectl -n bobrossbot get pods -o wide"

Write-Host "Done."
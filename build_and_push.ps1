param(
  [string]$Registry = "yourregistry",
  [string]$ImageName = "bobrossbot",
  [string]$Tag = "latest",
  [switch]$InstallDev
)

$full = "$Registry/$ImageName:$Tag"
$installDevArg = if ($InstallDev) { "true" } else { "false" }
Write-Host "Building $full (INSTALL_DEV=$installDevArg)"
# Pull latest base layers, pass build arg for reproducible behavior
docker build --pull --build-arg INSTALL_DEV=$installDevArg -t $full .
if ($LASTEXITCODE -ne 0) { Write-Error "docker build failed"; exit $LASTEXITCODE }

Write-Host "Pushing $full"
docker push $full
if ($LASTEXITCODE -ne 0) { Write-Error "docker push failed"; exit $LASTEXITCODE }

Write-Host "Done"

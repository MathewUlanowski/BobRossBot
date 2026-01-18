param(
  [string]$Registry = "yourregistry",
  [string]$ImageName = "bobrossbot",
  [string]$Tag = "latest"
)

$full = "$Registry/$ImageName:$Tag"
Write-Host "Building $full"
docker build -t $full .
Write-Host "Pushing $full"
docker push $full
Write-Host "Done"

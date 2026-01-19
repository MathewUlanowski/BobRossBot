docker build -t bobrossbot:latest .

helm upgrade --install bobross-bot ./helm `
  -f ./helm/values.local.yaml `
  --namespace bobross-bot-ns `
  --create-namespace
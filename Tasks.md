# Project Tasks: Bob Ross Discord Bot

## Goals
- [ ] Create a Discord bot that responds like Bob Ross.
- [ ] Integrate OpenAI's GPT API for generating responses.
- [ ] Dockerize the application for containerized deployment.
- [ ] Deploy the bot to a Kubernetes cluster using Helm charts.
- [ ] Ensure the bot is production-ready with proper error handling and logging.

## Progress

### Bot Development
- [x] Set up Node.js project with TypeScript.
- [x] Install dependencies: `discord.js`, `openai`, `dotenv`.
- [x] Create basic bot functionality to respond to messages.
- [x] Add `.env` file for managing secrets.

### Dockerization
- [x] Create a `Dockerfile` for the bot.
- [x] Test the Docker image locally.

### Kubernetes Deployment
- [x] Write Kubernetes manifests for Deployment, Service, and Secrets.
- [x] Create a Helm chart for easier deployment.
- [x] Test deployment on a local Kubernetes cluster. ✅
- [x] Build Docker image and push to container registry. (CI deploy workflow will build and push on merge to `main`)
- [ ] Deploy Helm chart to production cluster (create namespace `bobrossbot`).
- [ ] Prepare production deployment steps and secret setup; include non-disruptive rollout guidance.
- [ ] Add manual production deploy workflow (`workflow_dispatch`) to allow controlled rollouts via GitHub Actions.
- [ ] Add Kubernetes `readiness` and `liveness` probes (helm templates)
- [x] Add CI job to run tests on PRs (prevent merging failing changes)
- [x] Add CI job to run lint on PRs (prevent merging style issues)
- [ ] Implement OpenAI retry/backoff for transient errors (429/5xx)

### Production Readiness
- [ ] Add logging for better debugging and monitoring.
- [ ] Implement error handling for API calls and bot events.
- [x] Write unit tests for critical functionality. (Added `openaiHelper` unit tests and Jest setup)
- [ ] Set up CI/CD pipeline for automated testing and deployment.
- [x] Remove tracked coverage artifacts from repository (cleaned up coverage/ files)
- [ ] Add CI secrets to GitHub Actions (REGISTRY_URL, REGISTRY_USERNAME, REGISTRY_PASSWORD, KUBE_CONFIG, DISCORD_TOKEN, OPENAI_API_KEY).

## Notes
- Replace placeholders in `.env` and Kubernetes secrets with actual tokens before deployment.
- Ensure the bot complies with Discord's API terms of service.
- Monitor resource usage in Kubernetes to optimize scaling.
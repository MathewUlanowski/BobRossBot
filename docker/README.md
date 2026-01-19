# Docker workflow for BobRossBot 🐳

This folder documents local build & verification steps used for the `task/docker-optimize` change.

## Goals ✅
- Multi-stage build (separate build & runtime stages)
- Smaller runtime image (alpine base)
- Non-root runtime user and a lightweight `HEALTHCHECK`
- Add `.dockerignore` and instructions for local verification

## Build & Run (local)
1. Build: `docker build -t bobrossbot:pr-<id> .`
2. Run (replace envs):
   `docker run --rm -e DISCORD_TOKEN=... -e OPENAI_API_KEY=... -p 3000:3000 bobrossbot:pr-<id>`
3. Verify the container started:
   - `docker ps` to see running container
   - `docker logs <container-id>` to inspect startup logs
4. Health check (should return 200):
   - `curl -f http://localhost:3000/healthz` or `http --check-status GET http://localhost:3000/healthz` (alias `/health` also supported)

## Image size (before/after)
- Before: `docker build -t bobrossbot:before .` then: `docker images --format "{{.Repository}}:{{.Tag}} {{.Size}}" | grep bobrossbot`
- After: `docker build -t bobrossbot:pr-<id> .` then run the same `docker images` command and compare sizes

**Replace the size text below after you run the builds:**
- Before: **REPLACE_WITH_BEFORE_SIZE**
- After: **REPLACE_WITH_AFTER_SIZE**

## Notes & Security
- Do not commit `.env` or secret values. This repo previously contained a committed `.env` and k8s secrets; those values were sanitized in this branch. If your secrets were leaked, rotate them immediately.
- Use Kubernetes Secrets, sealed secrets, or a secret manager in production.

## Troubleshooting
- If `/health` is not responding, check the container logs for errors (e.g., missing environment variables like `DISCORD_TOKEN`).
- Use `docker inspect <container>` to validate exposed ports and networking.

# Local Setup & Verification ✅

Follow these steps to run and verify the bot locally (no secrets committed):

1. Install dependencies

   - npm install

2. Environment variables (use a local .env file or set in your shell):

   - DISCORD_TOKEN - your test Discord bot token (optional; leave empty to run simulation)
   - OPENAI_API_KEY - your OpenAI API key (optional; needed for real API calls)
   - GUILD_ID - optional for faster slash command registration in a test guild
   - PORT - optional port for health server (default 3000)

   Note: If `DISCORD_TOKEN` is not set, the app runs in a "simulation" mode that demonstrates the message flow and invokes the OpenAI client via `callWithRetry` using a simulated response.

3. Development run (fast feedback)

   - npm run dev

   Expected behavior:
   - If `DISCORD_TOKEN` is set, the bot attempts to log in and register the `/bobross` command (if `GUILD_ID` provided it registers to that guild).
   - If `DISCORD_TOKEN` is NOT set, the app logs a **simulation** message showing what the bot would reply.
   - A small health HTTP server will be started on `PORT` (default 3000).

4. Verify health endpoint

   - GET http://localhost:3000/healthz -> 200 OK (body: "ok")
   - GET http://localhost:3000/health -> 200 OK (body: "ok")

5. Build and test

   - npm run build  (TypeScript compile)
   - npm test (runs unit tests and coverage)

6. OpenAI retries/backoff

   - The OpenAI calls use `callWithRetry` in `src/openaiClient.ts`, which retries on 429 and 5xx responses and on transient network errors.
   - Unit tests cover success after retries, failure after max retries, network error retry, and non-retryable errors (400).

7. Logs

   - Structured JSON logs are produced to `logs/bobrossbot.log` for easier parsing.
   - Console output is human-friendly and includes timestamps and level.

8. Notes on secrets

   - Never commit `.env` or secrets into the repository.
   - Use ephemeral test tokens during verification and CI secrets for pipelines.

---

If you want, I can add a small helper script to simulate interactions in more depth or add a task-runner entry for quick verification. 👍

# PromptShield AI — backend

Local JSON API for PromptShield AI. It scans prompts for privacy risks using deterministic checks, Markdown policy rules, and a local LLM served by [Ollama](https://ollama.com). The Chrome extension (React + TypeScript) calls this service; it never calls Ollama directly.

See [docs/DESIGN.md](docs/DESIGN.md) for the full backend design: scan pipeline, API contract, rules format, and build plan.

## Prerequisites

- **Node.js 24** and npm (Node 20.19+ also works)
- **Ollama** installed and running, with the configured model pulled:

```sh
ollama pull qwen3:4b
```

## Quick start

```sh
cp .env.example .env
npm install
npm start
```

Then check <http://localhost:3000/health>. `localAi.ready` is `true` once Ollama is running and the model is downloaded.

## Configuration

All settings live in `.env` (copied from `.env.example`):

| Variable | Default | Used for |
| --- | --- | --- |
| `PORT` | `3000` | Port the HTTP server listens on |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Address of the Ollama server |
| `OLLAMA_MODEL` | `qwen3:4b` | Model used for contextual classification |
| `OLLAMA_TIMEOUT_MS` | `15000` | How long a scan waits for the model before reporting `ai.status: "timeout"` |
| `OLLAMA_KEEP_ALIVE` | `30m` | How long Ollama keeps the model loaded between scans |
| `ALLOWED_ORIGINS` | *(empty)* | Comma-separated origins allowed by CORS, e.g. `chrome-extension://<id>`. Empty allows any origin, for development only |

## API

| Method & path | Purpose | Status |
| --- | --- | --- |
| `GET /health` | Service status and local AI readiness | Done |
| `POST /api/scan` | Analyze a prompt for privacy risks (pattern detectors + local AI) | Done |
| `POST /api/redact` | Return a redacted version of a prompt | Done |
| `GET /api/rules` | Active rule metadata | Planned |
| `POST /api/rules/validate` | Validate a Markdown rule file | Planned |

Example `GET /health` response:

```json
{
  "status": "ok",
  "localAi": { "reachable": true, "version": "0.40.2", "model": "qwen3:4b", "modelAvailable": true, "ready": true }
}
```

Errors are always JSON: `{ "error": { "message": "..." } }`.

## npm scripts

| Script | What it does |
| --- | --- |
| `npm start` | Start the API |
| `npm run dev` | Start the API with `node --watch`, restarting on file changes |
| `npm test` | Run the test suite once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Project layout

```
app.js        Express app setup (middleware, routes, JSON error handler)
config.js     Validated environment settings
bin/www       HTTP server entry point
routes/       URL routing
controllers/  Request handlers
services/     Business logic (Ollama client, and later scanner, policy, redaction)
test/         Vitest + Supertest tests
```

To add an endpoint, put the handler in `controllers/`, any business logic in `services/`, map a path to it in a router under `routes/`, and mount that router in `app.js`.

## Troubleshooting

- **Port 3000 already in use**: set `PORT` in `.env`.
- **`localAi.reachable` is `false`**: Ollama isn't running. Start the Ollama app, or run `ollama serve`.
- **`localAi.modelAvailable` is `false`**: run `ollama pull` with the model named in `OLLAMA_MODEL`.
- **Scans report `ai.status: "timeout"`**: the model is too slow on this machine. Check `ollama ps`; on a CPU-only machine, raise `OLLAMA_TIMEOUT_MS` or switch `OLLAMA_MODEL` to a smaller model.
- **`ollama` command not found on Windows**: open a new terminal after installing, or use `%LOCALAPPDATA%\Programs\Ollama\ollama.exe`.

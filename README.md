# hackathon-backend

An Express app with EJS views, organized into routes, controllers, and services.

## Prerequisites

- **Node.js 24** and npm

## Quick start

```sh
cp .env.example .env
npm install
npm start
```

Open <http://localhost:3000>.

## Configuration

All settings live in `.env` (copied from `.env.example`):

| Variable | Default | Used for |
| --- | --- | --- |
| `PORT` | `3000` | Port the HTTP server listens on |

## npm scripts

| Script | What it does |
| --- | --- |
| `npm start` | Start the app |
| `npm run dev` | Start the app with nodemon, restarting it when a `.js` or `.json` file changes |

## Project layout

```
app.js        Express app setup (middleware, routes, error handler)
bin/www       HTTP server entry point
routes/       URL routing
controllers/  Request handlers
services/     Business logic
views/        EJS templates
public/       Static assets
```

To add an endpoint, put the handler in `controllers/`, any business logic in `services/`, map a path to it in a router under `routes/`, and mount that router in `app.js`.

## Troubleshooting

- **Port 3000 already in use**: set `PORT` in `.env`, or run `PORT=3001 npm start`.

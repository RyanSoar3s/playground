# Playground

> **Code Runner Online** — Execute JavaScript, TypeScript and Python code in isolated Docker containers.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack web application for running code snippets remotely in sandboxed environments. Built with **Bun** + **TypeScript** on the backend and **Angular 21** on the frontend, with **Docker** containers for secure code execution.

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        Browser                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Angular 21 SPA (Frontend)               │  │
│  │  Monaco Editor · WebSocket · RxJS · SCSS             │  │
│  └──────────┬───────────────────────────────────────────┘  │
│             │ HTTP (REST) / WebSocket                      │
└─────────────┼──────────────────────────────────────────────┘
              │
┌─────────────┼──────────────────────────────────────────────┐
│             │           Bun Server (Backend)               │
│  ┌──────────┴───────────────────────────────────────────┐  │
│  │  · Express-like routing via Bun.serve()              │  │
│  │  · WebSocket for real-time execution streams         │  │
│  │  · Zod validation · Error handling · CORS            │  │
│  └──────────┬───────────────────────────────────────────┘  │
│             │ Docker CLI (spawn/exec)                      │
└─────────────┼──────────────────────────────────────────────┘
              │
┌─────────────┼─────────────────────────────────────────────┐
│  ┌──────────┴──────────────────────────────────────────┐  │
│  │          Docker Containers (Sandbox)                │  │
│  │                                                     │  │
│  │  · --network none  · --memory 128m  · --cpus 0.5    │  │
│  │  · Read-only volumes · Auto-cleanup                 │  │
│  │                                                     │  │
│  │  Runtimes:                                          │  │
│  │  ┌──────────┬──────────┬──────────┬──────────┐      │  │
│  │  │  Node.js │  Bun     │ CPython  │  PyPy    │      │  │
│  │  │   (v24)  │  (v1.3)  │  (v3.14) │  (v3.11) │      │  │
│  │  └──────────┴──────────┴──────────┴──────────┘      │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

## Project Structure

```
playground/
├── backend/           # Bun/TypeScript HTTP + WebSocket server
│   ├── config/        # Environment variables
│   ├── src/
│   │   ├── errors/     # HttpError custom class
│   │   ├── models/     # TypeScript types (request, response, execution, etc.)
│   │   ├── routes/     # REST endpoints (health, languages)
│   │   ├── runners/    # Subprocess management (Bun.spawn + Docker)
│   │   ├── schemas/    # Zod validation schemas
│   │   ├── services/   # Execution orchestration
│   │   ├── utils/      # Docker command builders per runtime
│   │   └── validators/ # Payload validation
│   └── package.json
├── frontend/          # Angular 21 SPA
│   └── src/
│       ├── app/
│       │   ├── core/       # Services, guards, resolvers
│       │   ├── features/   # Components (code-editor, header, footer)
│       │   ├── models/     # TypeScript types
│       │   └── mocks/      # Test mocks
│       └── environments/   # Environment config
├── docker/            # Dockerfiles for each runtime
│   ├── javascript-typescript/
│   │   ├── bun/
│   │   └── nodejs/
│   └── python/
│       ├── cpython/
│       └── pypy/
└── runners/           # (reserved for runner scripts)
```

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.3
- [Docker](https://docker.com)
- [Node.js](https://nodejs.org) >= 22 (optional, for Angular CLI)

### 1. Build Docker Images

```bash
docker build -t playground-bun-runner     -f docker/javascript-typescript/bun/bun.DOCKERFILE .
docker build -t playground-nodejs-runner  -f docker/javascript-typescript/nodejs/nodejs.DOCKERFILE .
docker build -t playground-cpython-runner -f docker/python/cpython/cpython.DOCKERFILE .
docker build -t playground-pypy-runner    -f docker/python/pypy/pypy.DOCKERFILE .
```

### 2. Start the Backend

```bash
cd backend
bun install
bun start
```

The server starts on `http://localhost:3000` by default.

### 3. Start the Frontend

```bash
cd frontend
bun install
bun start
```

The app opens at `http://localhost:4200`.

### 4. Open in Browser

Navigate to `http://localhost:4200` and start coding.

## API Endpoints

| Method | Path              | Description                    |
|--------|-------------------|--------------------------------|
| GET    | `/api/health`     | Health check                   |
| GET    | `/api/languages`  | List supported languages/runtimes |
| WS     | `/api/executions` | WebSocket for code execution   |

### WebSocket Protocol

**Client → Server:**

```json
{ "type": "execute", "payload": { "language": "javascript", "runtime": "nodejs", "code": "console.log('hi')" } }
{ "type": "stdin",    "value": "user input\n" }
{ "type": "cancel" }
```

**Server → Client:**

```json
{ "type": "execution_started", "id": "...", "language": "...", "runtime": "..." }
{ "type": "output",            "stream": "stdout", "text": "..." }
{ "type": "input_request" }
{ "type": "result",            "result": { "status": "success", "stdout": "...", ... } }
{ "type": "error",             "error": { "status": "validation_error", ... } }
```

## Security

- **Container isolation**: Each execution runs in a dedicated Docker container
- **No network**: `--network none` prevents containers from accessing the internet
- **Resource limits**: 128 MB memory, 0.5 CPU cores
- **Read-only filesystem**: Code files mounted as `:ro`
- **Hard timeout**: 30 seconds max execution time
- **Output limit**: 50 KB max stdout capture
- **Input timeout**: 10 seconds idle before timeout

## Supported Languages & Runtimes

| Language   | Runtimes            |
|------------|---------------------|
| JavaScript | Node.js 24, Bun 1.3 |
| TypeScript | Node.js 24, Bun 1.3 |
| Python     | CPython 3.14, PyPy 3.11 |

## License

[MIT](LICENSE)

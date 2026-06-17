# Backend — Playground Server

HTTP + WebSocket server built with **Bun** and **TypeScript** for executing user code in isolated Docker containers.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) 1.3+
- **Language**: TypeScript (strict mode)
- **Validation**: [Zod](https://zod.dev) 4.x
- **Environment**: dotenv

## Project Structure

```
backend/
├── config/
│   └── env.ts              # Environment variables (Origin, Port)
├── src/
│   ├── app.ts               # Entry point — boots server
│   ├── server.ts            # Bun.serve() — HTTP routes + WebSocket
│   ├── errors/
│   │   └── http-error.ts    # Custom HttpError class
│   ├── models/
│   │   ├── execution-message.model.ts  # WebSocket message types
│   │   ├── execution.model.ts          # Execution callbacks & data
│   │   ├── languages.model.ts          # Language & runtime enums
│   │   ├── request.model.ts            # Execution request payload
│   │   ├── response.model.ts           # Response shapes (result, error, health)
│   │   └── runner.model.ts             # Runner command & result types
│   ├── routes/
│   │   ├── health.ts        # GET /api/health
│   │   └── languages.ts     # GET /api/languages
│   ├── runners/
│   │   └── runner.ts        # Subprocess manager (Bun.spawn + Docker)
│   ├── schemas/
│   │   └── schema.ts        # Zod validation schema
│   ├── services/
│   │   └── execution.service.ts  # Execution orchestration
│   ├── utils/
│   │   ├── bun.util.ts      # Docker command for Bun
│   │   ├── cpython.util.ts  # Docker command for CPython
│   │   ├── generate-id.ts   # Unique ID generator
│   │   ├── language-list.ts # Static language configuration
│   │   ├── nodejs.util.ts   # Docker command for Node.js
│   │   └── pypy.util.ts     # Docker command for PyPy
│   └── validators/
│       └── payload.ts       # Request payload validation
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.3
- [Docker](https://docker.com) (with runtime images built — see root [README](../README.md))

### Install

```bash
bun install
```

### Run

```bash
bun start
```

Starts the server on `http://localhost:3000` by default. Set the `Port` environment variable to change it.

### Environment Variables

| Variable | Default                  | Description                |
|----------|--------------------------|----------------------------|
| `Port`   | `3000`                   | Server port                |
| `Origin` | `http://localhost:4200`  | Allowed CORS origin        |

## API

### REST Endpoints

#### `GET /api/health`

Health check endpoint.

**Response:**
```json
{ "status": "ok", "error": null }
```

#### `GET /api/languages`

Returns the list of supported languages and runtimes.

**Response:**
```json
{
  "languages": [
    { "id": "javascript", "label": "JavaScript", "runtimes": [{ "type": "nodejs", "version": "24" }, { "type": "bun", "version": "1.3" }], "enabled": true },
    { "id": "typescript", "label": "TypeScript", "runtimes": [{ "type": "nodejs", "version": "24" }, { "type": "bun", "version": "1.3" }], "enabled": true },
    { "id": "python",     "label": "Python",     "runtimes": [{ "type": "cpython", "version": "3.14" }, { "type": "pypy", "version": "3.11" }], "enabled": true }
  ]
}
```

### WebSocket Endpoint

#### `WS /api/executions`

Real-time code execution interface.

**Client → Server messages:**

| Type      | Payload                                        | Description             |
|-----------|------------------------------------------------|-------------------------|
| `execute` | `{ language, runtime, code }`                  | Start code execution    |
| `stdin`   | `{ value }`                                    | Send stdin input        |
| `cancel`  | —                                              | Cancel running execution |

**Server → Client messages:**

| Type                | Payload                                        | Description                |
|---------------------|------------------------------------------------|----------------------------|
| `execution_started` | `{ id, language, runtime }`                    | Execution has started      |
| `output`            | `{ stream: "stdout"|"stderr", text }`          | Real-time output chunk     |
| `input_request`     | —                                              | Server waiting for stdin   |
| `result`            | `{ result }`                                   | Execution completed        |
| `error`             | `{ error }`                                    | Execution failed           |

## Execution Flow

1. Client connects via WebSocket to `/api/executions`
2. Client sends `{ type: "execute", payload }`
3. Server validates payload with Zod
4. Server writes code to a temp file in `/tmp/playground/`
5. Server spawns `docker run --rm --network none ... <image> <runtime> <file>`
6. Server streams stdout/stderr back to the client in real-time
7. On idle detection (1s no output), server sends `input_request` and waits 10s for stdin
8. After process exits or hard timeout (30s), server sends `result` or `error`
9. Temp file is cleaned up in the `finally` block

## Security

See the [root README](../README.md#security) for details on Docker sandboxing.

## Development

The server runs with Hot Reload via Bun:

```bash
bun run --hot ./src/app.ts
```

## Scripts

| Command     | Description           |
|-------------|-----------------------|
| `bun start` | Start with hot reload |
| `bun run`   | Run once without watch|

## License

[MIT](../LICENSE)

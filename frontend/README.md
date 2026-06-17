# Frontend — Playground UI

Angular 21 single-page application with the **Monaco Editor** for writing and executing code in real-time via WebSocket.

## Tech Stack

- **Framework**: [Angular](https://angular.dev) 21 (standalone components)
- **Language**: TypeScript ~5.9
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) via `@ng-util/monaco-editor`
- **State**: Angular Signals (`signal()`, `computed()`, `effect()`)
- **WebSocket**: RxJS `webSocket()`
- **Icons**: Font Awesome (free-regular + free-solid)
- **Testing**: Vitest + jsdom
- **Styling**: SCSS
- **Package Manager**: Bun

## Project Structure

```
frontend/
├── src/
│   ├── index.html               # Entry HTML
│   ├── main.ts                  # Angular bootstrap
│   ├── styles.scss              # Global styles
│   └── app/
│       ├── app.config.ts        # App configuration & providers
│       ├── app.routes.ts        # Routing (/, /error)
│       ├── app.html             # Root component template
│       ├── app.scss             # Root component styles
│       ├── app.ts               # Root component
│       ├── app.spec.ts          # Root component test
│       ├── core/
│       │   ├── guards/
│       │   │   ├── error-guard.ts      # Redirect to /error if health fails
│       │   │   └── health-guard.ts     # Health check guard
│       │   ├── resolvers/
│       │   │   └── get-languages-resolver.ts  # Pre-fetch languages
│       │   └── services/
│       │       ├── api.ts               # HTTP base service
│       │       ├── get-languages.ts     # Languages service (signal-based)
│       │       ├── health.ts            # Health check service
│       │       ├── responsive.ts        # Responsive breakpoint detection
│       │       └── websocket.ts         # WebSocket execution service
│       ├── features/
│       │   ├── components/
│       │   │   ├── code-editor/         # Main code editor component
│       │   │   ├── footer/              # Footer component
│       │   │   └── header/              # Header component
│       │   └── shared/
│       │       ├── error/               # Error page component
│       │       ├── loading-skeleton/    # Skeleton loading screen
│       │       └── spin-loader/         # Spinner loading indicator
│       ├── mocks/                       # Test mocks (api, health, websocket, etc.)
│       ├── models/                      # TypeScript interfaces (code-execution, language-list, etc.)
│       └── styles/
│           ├── global.scss              # Global SCSS variables & utilities
│           └── util.scss                # Utility classes
├── environments/
│   ├── environment.ts                   # Production environment
│   └── environment.development.ts       # Development environment
├── public/
│   └── favicon.ico
├── package.json
├── angular.json
├── tsconfig.json / tsconfig.app.json / tsconfig.spec.json
└── README.md
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.3 (or Node.js >= 22 + npm/pnpm/yarn)
- Backend server running (see [backend/README.md](../backend/README.md))

### Install

```bash
bun install
```

### Run (Development)

```bash
bun start
```

Navigue to `http://localhost:4200`.

### Build

```bash
bun run build
```

### Test

```bash
bun test
```

## Features

### Code Editor

- **Monaco Editor** with syntax highlighting for JavaScript, TypeScript, and Python
- **4 themes**: VS Dark, VS Light, High Contrast Black, High Contrast Light
- **Font ligatures** with Fira Code
- **Configurable font size** (16px by default)
- **Auto-closing brackets**, tab size 2

### Language & Runtime Selection

- **Dropdown** for language selection (JavaScript, TypeScript, Python)
- **Dropdown** for runtime selection per language (e.g., Node.js v24, Bun v1.3)
- **Code templates** auto-loaded when switching languages

### Code Execution

- **Real-time output** streamed via WebSocket
- **Stdin input** support for interactive programs
- **Execution status display** (success, error, timeout) with exit code
- **Duration display** in milliseconds
- **Cancel** button to abort running execution
- **Output truncation** indicator for large outputs (>50 KB)

### Error Handling

- **Health check guard**: Redirects to `/error` if backend is unreachable
- **Error page** with retry option
- **Validation errors** displayed from the backend

## Environment Configuration

| Variable | Default                        | Description              |
|----------|--------------------------------|--------------------------|
| `apiUrl` | `http://localhost:3000`        | Backend HTTP URL         |
| `wsUrl`  | Derived from `apiUrl` (http→ws)| WebSocket URL (optional) |

Configured in `src/environments/environment.ts` and `src/environments/environment.development.ts`.

## Components

| Component         | Description                                       |
|-------------------|---------------------------------------------------|
| `CodeEditor`      | Main playground — editor, controls, output, stdin |
| `Header`          | App header with title and health indicator        |
| `Footer`          | Footer with links and information                 |
| `Error`           | Error page displayed on health check failure      |
| `LoadingSkeleton` | Skeleton UI while languages are loading           |
| `SpinLoader`      | Loading spinner indicator                         |

## WebSocket Integration

The `ExecutionWebSocket` service wraps RxJS's `webSocket()` to provide:

- **executeCode(payload)**: Returns an `Observable<ExecutionServerMessage>` that emits output chunks, input requests, results, and errors
- **sendStdin(value)**: Sends user input to the running process
- **cancel()**: Cancels the current execution

Messages are automatically deserialized from JSON, and the socket closes on `result` or `error` events.

## Styling

- **Global SCSS** with CSS custom properties for theming
- **Responsive design** via `Responsive` service (detects mobile/tablet/desktop breakpoints)
- **Utility classes** in `util.scss` (flex, spacing, text, etc.)

## License

[MIT](../LICENSE)

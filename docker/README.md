# Docker — Runtime Images

This directory contains Dockerfiles for each runtime used to execute user code in isolated sandbox containers.

## Images

| Image Name                     | Runtime     | Base Image       | Dockerfile                                      |
|--------------------------------|-------------|------------------|-------------------------------------------------|
| `playground-bun-runner`        | Bun 1.3     | `oven/bun:1.3`   | `javascript-typescript/bun/bun.DOCKERFILE`      |
| `playground-nodejs-runner`     | Node.js 24  | `oven/bun:1.3`   | `javascript-typescript/nodejs/nodejs.DOCKERFILE` |
| `playground-cpython-runner`    | CPython 3.14| `python:3.14`    | `python/cpython/cpython.DOCKERFILE`             |
| `playground-pypy-runner`       | PyPy 3.11   | `pypy:3.11`     | `python/pypy/pypy.DOCKERFILE`                   |

## Build Commands

Build all images from the project root:

```bash
docker build -t playground-bun-runner     -f docker/javascript-typescript/bun/bun.DOCKERFILE docker/javascript-typescript/bun
docker build -t playground-nodejs-runner  -f docker/javascript-typescript/nodejs/nodejs.DOCKERFILE docker/javascript-typescript/nodejs
docker build -t playground-cpython-runner -f docker/python/cpython/cpython.DOCKERFILE docker/python/cpython
docker build -t playground-pypy-runner    -f docker/python/pypy/pypy.DOCKERFILE docker/python/pypy
```

Or use one-liners from the project root:

```bash
# JavaScript/TypeScript runtimes
docker build -t playground-bun-runner     -f docker/javascript-typescript/bun/bun.DOCKERFILE .
docker build -t playground-nodejs-runner  -f docker/javascript-typescript/nodejs/nodejs.DOCKERFILE .

# Python runtimes
docker build -t playground-cpython-runner -f docker/python/cpython/cpython.DOCKERFILE .
docker build -t playground-pypy-runner    -f docker/python/pypy/pypy.DOCKERFILE .
```

## Security

Each container runs with the following restrictions applied by the backend:

- `--network none` — no network access
- `--memory 128m` — 128 MB memory limit
- `--cpus 0.5` — 0.5 CPU cores
- Read-only volume mounts (`:ro`)
- `--rm` — automatic container cleanup after exit

## Directory Structure

```
docker/
├── javascript-typescript/
│   ├── bun/
│   │   └── bun.DOCKERFILE         # Bun 1.3 (based on oven/bun)
│   └── nodejs/
│       └── nodejs.DOCKERFILE      # Node.js 24 (via Bun image)
├── python/
│   ├── cpython/
│   │   └── cpython.DOCKERFILE     # CPython 3.14 (based on python:3.14)
│   └── pypy/
│       └── pypy.DOCKERFILE        # PyPy 3.11 (based on pypy:3.11)
└── README.md

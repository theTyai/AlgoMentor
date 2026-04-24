# AlgoMentor Platform Architecture

## Vision

AlgoMentor is evolving from a lightweight JavaScript visualizer into an intelligent DSA learning platform with:

- guided execution tracing
- dynamic visualizations
- sandboxed code execution
- algorithm complexity analysis
- collaborative teaching workflows
- personalized learner feedback

The platform should support both educational depth and operational scale.

## Product Layers

### 1. Experience Layer

Frontend responsibilities:

- code editor and problem workspace
- playback timeline and execution controls
- visualizers for arrays, stacks, queues, trees, graphs, and recursion
- explanation panels
- instructor and collaboration overlays
- analytics dashboards for learners and instructors

Recommended frontend stack:

- React
- SVG/Canvas rendering for visualizers
- state management via React context or Zustand/Redux when collaboration expands
- WebSocket client for live sessions

### 2. Application API Layer

Backend gateway responsibilities:

- authentication and session management
- execution orchestration
- route validation
- rate limiting
- API composition across microservices

Recommended backend shape:

- API gateway service in Node.js + Express
- feature services separated by domain
- shared contracts for trace events and analysis responses

### 3. Core Intelligence Layer

Services:

- parsing service
- execution trace service
- visualization data transformer
- complexity analysis service
- explanation service
- optimization suggestion service

This layer converts code into structured learning artifacts rather than only raw execution results.

### 4. Secure Execution Layer

Responsibilities:

- run arbitrary code safely
- enforce time and memory limits
- isolate language runtimes
- queue and schedule execution jobs

Recommended production approach:

- Docker-based worker pool
- one worker image per language
- job queue with retries and dead-letter handling
- strict syscall/network restrictions

### 5. Data Layer

Persistent storage:

- PostgreSQL for users, sessions, problems, curricula, analytics, and saved traces
- Redis for cache, pub/sub, rate limiting, and ephemeral collaborative state
- object storage for large execution recordings or exported reports

## Proposed Service Architecture

### API Gateway

Responsibilities:

- expose public REST/WebSocket APIs
- authorize requests
- fan out to downstream services
- normalize responses

Core routes:

- `POST /run-code`
- `POST /execute`
- `POST /bubble-sort`
- `POST /recursion`
- `POST /analyze-complexity`
- future:
  - `POST /parse`
  - `POST /explain`
  - `POST /profile`
  - `POST /collab/session`

### Parsing Service

Responsibilities:

- parse code using AST tooling
- produce normalized intermediate representation
- classify supported constructs
- identify visualization-friendly code

Future tooling by language:

- JavaScript/TypeScript: Babel or Acorn
- Python: tree-sitter or Python parser service
- C++: clang-based parser service

Outputs:

- AST summary
- supported visualization mode
- semantic metadata

### Execution Trace Service

Responsibilities:

- simulate supported code structures
- emit structured execution events
- maintain variable snapshots, call frames, and control flow metadata

Standard trace event shape:

```json
{
  "timestamp": 1710000000000,
  "step": 12,
  "line": "sum += arr[i]",
  "operation": "addition",
  "variables": {
    "i": 2,
    "sum": 8
  },
  "memory": {},
  "callStack": []
}
```

### Visualization Transformer Service

Responsibilities:

- translate traces into UI-friendly render models
- derive animation intent such as compare, swap, insert, pop, recurse, return
- support data-structure-specific schemas

Example transformer outputs:

- array render state
- tree snapshot
- graph traversal state
- recursion stack frame state

### Complexity Analysis Service

Responsibilities:

- detect loops, recursion, divide-and-conquer patterns
- estimate time and space complexity
- explain reasoning
- compare theoretical complexity with runtime profiles

Future expansion:

- recurrence relation solving
- asymptotic confidence scoring
- optimization recommendations

### Explanation Service

Responsibilities:

- turn traces into beginner-friendly teaching copy
- explain why a branch executed
- explain why recursion stops
- suggest optimizations and alternate approaches

This service can combine:

- rules-based educational templates
- LLM-based explanation generation with prompt guardrails

### Sandbox Execution Service

Responsibilities:

- run arbitrary code in isolated environments
- capture stdout/stderr
- report runtime, memory, and exit status

Production execution contract:

```json
{
  "mode": "sandbox",
  "output": "5",
  "error": null,
  "executionTimeMs": 7,
  "memoryUsageKb": 512,
  "language": "javascript"
}
```

### Collaboration Service

Responsibilities:

- manage live rooms
- sync editor changes
- sync playback cursor
- support annotations and instructor controls

Transport:

- WebSockets
- Redis pub/sub for horizontal scaling

## Current Repo Mapping

The current repo already contains a useful seed foundation:

- `backend/executionEngine.js`
- `backend/executionController.js`
- `backend/sandboxExecutor.js`
- `backend/bubbleSortEngine.js`
- `backend/recursionEngine.js`
- `backend/complexityAnalyzer.js`

Current maturity:

- good prototype foundation for JavaScript learning workflows
- not yet AST-driven
- not yet multi-language
- not yet service-separated
- not yet production sandbox hardened

## Recommended Domain Modules

### Backend Modules

- `gateway`
- `execution`
- `analysis`
- `visualization`
- `sandbox`
- `collaboration`
- `curriculum`
- `analytics`

### Frontend Modules

- `editor`
- `trace-player`
- `visualizers`
- `explanations`
- `collaboration`
- `curriculum`
- `analytics`

## Canonical API Contracts

### Run Code

`POST /run-code`

Request:

```json
{
  "language": "javascript",
  "code": "console.log(2 + 3)"
}
```

Response:

```json
{
  "mode": "sandbox",
  "steps": [],
  "output": "5",
  "error": null,
  "executionTime": 3
}
```

### Visual Execution

`POST /execute`

Response:

```json
{
  "steps": [
    {
      "step": 1,
      "line": "sum += i",
      "variables": {
        "i": 0,
        "sum": 0
      },
      "operation": "addition",
      "timestamp": 1710000000000
    }
  ]
}
```

### Complexity Analysis

`POST /analyze-complexity`

Response:

```json
{
  "complexity": "O(n^2)",
  "spaceComplexity": "O(1)",
  "explanation": "Nested loops detected"
}
```

## Database Model Direction

### PostgreSQL Tables

- `users`
- `sessions`
- `problems`
- `submissions`
- `execution_runs`
- `execution_traces`
- `learning_modules`
- `progress_snapshots`
- `annotations`
- `analytics_events`

### Redis Usage

- collaboration room presence
- playback cursor sync
- hot trace caching
- request throttling
- job queue coordination

## Security Model

### Required Protections

- Docker or equivalent container isolation
- no direct host process execution for arbitrary user code
- network disabled inside execution containers
- filesystem isolation
- strict CPU and memory quotas
- request validation
- API rate limiting
- audit logging

### Current State

The current VM-based JavaScript sandbox is suitable for a prototype learning environment, but it is not sufficient as the final production sandbox for hostile workloads.

## Scalability Strategy

### Execution

- enqueue sandbox jobs
- autoscale worker pods
- cache repeated deterministic runs
- separate visual execution from general sandbox execution

### Collaboration

- WebSocket gateway with Redis fanout
- room sharding for large classrooms

### Visualization

- virtualize large timelines
- render only active windows of trace data
- progressively load large traces

## Observability

Track:

- request latency
- sandbox timeout rate
- trace generation failures
- queue depth
- worker CPU and memory
- learner completion funnels

Tools:

- structured logs
- metrics dashboards
- distributed tracing

## Deployment Strategy

### Environments

- local dev
- staging
- production

### Infrastructure Direction

- Docker Compose for local multi-service setup
- Kubernetes or ECS for production
- managed PostgreSQL
- managed Redis
- object storage for exports

## Definition of Production Readiness

AlgoMentor becomes production-grade when it includes:

- hardened sandbox isolation
- durable data storage
- role-based auth
- scalable job execution
- collaboration with reconnect support
- curriculum management
- analytics and observability
- testing strategy across parser, trace, API, and UI layers

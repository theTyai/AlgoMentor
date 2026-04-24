# AlgoMentor Implementation Roadmap

## Phase 1: Solidify The Prototype

Status:

- completed

Goal:

- turn the current demo into a reliable single-user learning workspace

Deliverables:

- unify `/run-code` into the frontend
- show visual mode vs sandbox mode in UI
- display sandbox stdout, errors, and execution time
- add shared response types for all execution routes
- add backend unit tests for execution controller and analyzers

Exit criteria:

- JavaScript code can be run safely through either visual mode or sandbox mode
- frontend clearly explains which mode was used

Phase 1 completion notes:

- code editor uses `/run-code`
- frontend surfaces visual vs sandbox execution clearly
- sandbox results show stdout, runtime errors, and timing
- execution-style routes now share a common response contract
- backend test coverage exists for controller routing, timeouts, and complexity analysis

## Phase 2: Trace Platform Foundation

Status:

- completed

Goal:

- standardize traces as first-class objects

Deliverables:

- canonical trace event schema
- trace serialization helpers
- trace playback store in frontend
- timeline scrubber and jump-to-step controls
- replay support for visual, bubble sort, and recursion engines

Exit criteria:

- all visual features use a shared trace format

Phase 2 completion notes:

- canonical trace event schema added
- trace serialization helpers added on the backend
- visual responses now include shared `trace` payloads
- execution, bubble sort, and recursion now emit standardized trace events
- frontend playback state moved into a shared trace player hook
- scrubber and jump-to-step controls added for visual playback

## Phase 3: AST-Based Parsing Layer

Goal:

- move from regex-based detection to AST-backed classification

Deliverables:

- JavaScript parser service using Babel or Acorn
- code feature classification
- intermediate representation for supported constructs
- visualizability detector backed by AST

Exit criteria:

- controller can classify simple code using AST instead of string heuristics

## Phase 4: Data Structure Visualization Expansion

Goal:

- support more than arrays and stacks

Deliverables:

- linked list visualizer
- tree visualizer
- graph traversal visualizer
- queue and stack modules
- animation intents for insert/delete/traverse

Exit criteria:

- at least 5 DSA structures render from trace data

## Phase 5: Intelligent Explanation Layer

Goal:

- teach instead of only replaying

Deliverables:

- rules-based explanations for loops, recursion, and complexity
- prompt-ready explanation service abstraction
- beginner/intermediate explanation modes
- optimization hints for common anti-patterns

Exit criteria:

- every supported trace step can be paired with learner-facing explanation text

## Phase 6: Hardened Sandbox Infrastructure

Goal:

- move from in-process VM to production-safe isolated execution

Deliverables:

- Docker worker service
- job queue
- timeout and memory enforcement
- stdout/stderr capture
- support for JavaScript, Python, and C++

Exit criteria:

- arbitrary code never executes directly in the API process

## Phase 7: Complexity + Profiling Intelligence

Goal:

- connect theory and actual runtime behavior

Deliverables:

- empirical profiling runner
- input scaling experiments
- plots of input size vs execution time
- time complexity explanation upgrades
- space complexity estimation

Exit criteria:

- learners can compare predicted complexity vs observed behavior

## Phase 8: Collaboration

Goal:

- support classrooms, peer learning, and instructor-led sessions

Deliverables:

- live shared editor
- synchronized playback state
- live annotations
- instructor controls and room roles

Exit criteria:

- multiple users can inspect the same trace in real time

## Phase 9: Curriculum + Analytics

Goal:

- make AlgoMentor usable as a learning product

Deliverables:

- guided lesson modules
- practice problem metadata
- progress tracking
- misconception analytics
- personalized recommendations

Exit criteria:

- users receive learning insights and guided next steps

## Immediate Next Sprint Recommendation

Best next implementation targets for this repo:

1. Define a canonical trace event schema used by execution, bubble sort, and recursion engines.
2. Add trace serialization helpers and central trace metadata utilities.
3. Introduce a frontend trace playback store for shared replay behavior.
4. Replace string heuristics with AST detection for JavaScript.
5. Start Phase 2 timeline controls such as jump-to-step and scrubber support.

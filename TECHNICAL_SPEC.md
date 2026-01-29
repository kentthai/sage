# Sage - Technical Specification

> **Codename:** Sage
> **Status:** Pre-development
> **Last Updated:** 2026-01-26

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target Users](#2-target-users)
3. [Technology Stack](#3-technology-stack)
4. [Interface Abstractions](#4-interface-abstractions)
5. [Architecture Overview](#5-architecture-overview)
6. [Data Model](#6-data-model)
7. [Feature Specifications](#7-feature-specifications)
8. [AI Integration](#8-ai-integration)
9. [Security & Privacy](#9-security--privacy)
10. [Testing Strategy](#10-testing-strategy)
11. [Infrastructure & Deployment](#11-infrastructure--deployment)
12. [Development Phases](#12-development-phases)
13. [Out of Scope for MVP](#13-out-of-scope-for-mvp)
14. [Open Questions](#14-open-questions)

---

## 1. Product Overview

### 1.1 Vision

Sage is an AI-powered lifelong learning agent and journal. It helps users capture, organize, and grow their knowledge through conversational interaction. Unlike passive note-taking tools, Sage actively participates in the user's learning journey by auto-categorizing knowledge, suggesting connections, and identifying gaps.

### 1.2 Core Differentiators

1. **AI-first knowledge building**: Conversational capture with smart organization is the core experience, not an add-on
2. **Learning-focused (not just notes)**: Active suggestions, gap detection, and learning path guidance
3. **Interview-style capture**: AI asks clarifying questions to build deep, structured understanding

### 1.3 MVP Feature Set

The minimum viable product includes:
- Text-based chat interface with AI
- Knowledge node creation with title, content, tags, and metadata
- AI-powered auto-categorization (with user confirmation)
- Hybrid knowledge graph (loose hierarchy + cross-linking)
- Force-directed graph visualization
- Search (natural language, keyword, and graph traversal)
- User authentication (email/password)
- Async AI suggestion generation after each knowledge addition

---

## 2. Target Users

**Primary:** General lifelong learners - curious individuals who want to organize and grow their knowledge systematically.

**User Personas:**
- Self-directed learners building expertise in new domains
- Professionals tracking knowledge in evolving fields
- Hobbyists systematizing their interests
- Researchers connecting ideas across disciplines

**Initial Scope:** Single-user application. Architecture should support future multi-user and collaboration features.

---

## 3. Technology Stack

### 3.1 Overview

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Language | TypeScript | Full-stack type safety, shared types between packages |
| Frontend | React | Large ecosystem, team familiarity |
| State Management | React Query + Zustand | Server state (React Query), UI state (Zustand) |
| Styling | Tailwind CSS | Utility-first, highly customizable |
| Backend | Node.js + Express (or NestJS) | TypeScript ecosystem, good async support |
| API Style | REST | Simple, well-understood, easy to debug |
| Primary Database | PostgreSQL | Relational data, versioning, full-text search |
| Graph Database | Neo4j (AuraDB Free Tier) | Complex relationship queries, optional for MVP |
| LLM Provider | Claude API (abstracted) | Strong reasoning, structured outputs |
| Testing | Vitest + Playwright | Fast unit tests, E2E coverage |

### 3.2 Repository Structure

Monorepo using npm/pnpm workspaces, designed for future separation:

```
sage/
├── packages/
│   ├── api/                 # Backend service
│   │   ├── src/
│   │   │   ├── controllers/ # Route handlers
│   │   │   ├── services/    # Business logic
│   │   │   ├── repositories/# Data access
│   │   │   ├── interfaces/  # Provider interfaces (swappable components)
│   │   │   ├── infrastructure/ # Interface implementations
│   │   │   │   ├── llm/     # LLM providers (Claude, OpenAI, Ollama)
│   │   │   │   ├── queue/   # Job queue (BullMQ, Postgres, SQS)
│   │   │   │   ├── cache/   # Cache providers (Redis, In-memory)
│   │   │   │   ├── search/  # Search providers (Postgres FTS, Elasticsearch)
│   │   │   │   └── graph/   # Graph providers (Postgres, Neo4j)
│   │   │   ├── container.ts # Dependency injection setup
│   │   │   └── types/       # Backend-specific types
│   │   ├── tests/
│   │   └── package.json
│   ├── web/                 # React frontend
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   ├── pages/       # Route pages
│   │   │   ├── hooks/       # Custom hooks
│   │   │   ├── stores/      # Zustand stores
│   │   │   ├── api/         # API client
│   │   │   └── types/       # Frontend-specific types
│   │   ├── tests/
│   │   └── package.json
│   └── shared/              # Shared types and utilities
│       ├── src/
│       │   ├── types/       # Shared TypeScript types
│       │   └── utils/       # Shared utilities
│       └── package.json
├── docker/
│   ├── docker-compose.yml   # Local development stack
│   └── Dockerfile.*         # Container definitions
├── docs/                    # Documentation
├── e2e/                     # End-to-end tests
├── package.json             # Root workspace config
└── tsconfig.base.json       # Shared TypeScript config
```

---

## 4. Interface Abstractions

A key architectural principle is **technology swappability**. All external dependencies and infrastructure components are accessed through interfaces, allowing implementations to be swapped via configuration without changing business logic.

### 4.1 Swappability Matrix

| Component | Initial Choice | Alternatives | Swap Difficulty | Interface |
|-----------|---------------|--------------|-----------------|-----------|
| **Runtime** | Node.js | - | Hard | N/A (fundamental) |
| **Language** | TypeScript | - | Hard | N/A (fundamental) |
| **Database** | PostgreSQL | MySQL, MongoDB | Medium | `Repository<T>` |
| **Graph DB** | Postgres adjacency | Neo4j, Neptune | Easy | `GraphProvider` |
| **LLM** | Claude API | OpenAI, Ollama, Bedrock | Easy | `LLMProvider` |
| **Job Queue** | BullMQ + Redis | Postgres queue, SQS | Easy | `JobQueue` |
| **Cache** | Redis | Memcached, In-memory | Easy | `CacheProvider` |
| **Search** | Postgres FTS | Elasticsearch, Meilisearch | Medium | `SearchProvider` |
| **Auth** | JWT + bcrypt | Session-based, OAuth | Medium | `AuthProvider` |
| **Notifications** | In-app | Email, Push, SMS | Easy | `NotificationProvider` |
| **Frontend** | React | - | Hard | N/A (fundamental) |
| **State Mgmt** | React Query + Zustand | Redux, Jotai | Medium | Custom hooks |
| **Styling** | Tailwind | CSS Modules, styled-components | Medium | Component abstraction |

### 4.2 Core Interfaces

All interfaces are defined in `packages/api/src/interfaces/`.

#### 4.2.1 Job Queue Interface

Abstracts async job processing. Can be implemented with BullMQ, Postgres-based queue, AWS SQS, etc.

```typescript
// packages/api/src/interfaces/job-queue.ts

export interface Job<T = unknown> {
  id: string;
  type: string;
  payload: T;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  processedAt?: Date;
  failedAt?: Date;
  error?: string;
}

export interface JobOptions {
  /** Delay in milliseconds before processing */
  delay?: number;
  /** Priority (higher = processed sooner) */
  priority?: number;
  /** Maximum retry attempts (default: 3) */
  retries?: number;
  /** Backoff delay in ms between retries */
  backoff?: number;
  /** Unique job ID to prevent duplicates */
  jobId?: string;
}

export type JobHandler<T> = (payload: T) => Promise<void>;

export interface JobQueue {
  /** Add a job to the queue */
  enqueue<T>(type: string, payload: T, options?: JobOptions): Promise<string>;

  /** Register a handler for a job type */
  process<T>(type: string, handler: JobHandler<T>): void;

  /** Get job by ID */
  getJob(jobId: string): Promise<Job | null>;

  /** Get jobs by status */
  getJobs(status: Job['status'], limit?: number): Promise<Job[]>;

  /** Cancel a pending job */
  cancel(jobId: string): Promise<boolean>;

  /** Pause processing (jobs still enqueue) */
  pause(): Promise<void>;

  /** Resume processing */
  resume(): Promise<void>;

  /** Graceful shutdown - finish current jobs */
  close(): Promise<void>;
}
```

#### 4.2.2 LLM Provider Interface

Abstracts LLM interactions. Can be implemented for Claude, OpenAI, Ollama, AWS Bedrock, etc.

```typescript
// packages/api/src/interfaces/llm-provider.ts

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  /** Maximum tokens in response */
  maxTokens?: number;
  /** Temperature (0-1, lower = more deterministic) */
  temperature?: number;
  /** Model override (provider-specific) */
  model?: string;
  /** Stop sequences */
  stopSequences?: string[];
}

export interface LLMProvider {
  /** Provider name for logging/debugging */
  readonly name: string;

  /** Simple chat completion */
  chat(messages: LLMMessage[], options?: LLMOptions): Promise<string>;

  /** Streaming chat completion (optional) */
  chatStream?(messages: LLMMessage[], options?: LLMOptions): AsyncIterable<string>;

  /** Structured output with JSON schema validation */
  structured<T>(
    prompt: string,
    schema: Record<string, unknown>,
    options?: LLMOptions
  ): Promise<T>;

  /** Count tokens in text (for context management) */
  countTokens?(text: string): Promise<number>;
}

// High-level AI operations built on LLMProvider
export interface AIService {
  /** Extract knowledge from chat content */
  categorize(content: string, context: CategorizeContext): Promise<CategorizeSuggestion>;

  /** Find connections between nodes */
  findConnections(
    node: KnowledgeNode,
    candidates: KnowledgeNode[]
  ): Promise<ConnectSuggestion[]>;

  /** Summarize a set of nodes */
  summarize(nodes: KnowledgeNode[]): Promise<string>;

  /** Suggest next learning topics */
  suggestLearning(
    graph: GraphData,
    interests: string[]
  ): Promise<LearnNextSuggestion[]>;
}

export interface CategorizeContext {
  existingTags: Tag[];
  existingNodes: KnowledgeNode[]; // sample for context
  userInterests: string[];
}
```

#### 4.2.3 Cache Provider Interface

Abstracts caching. Can be implemented with Redis, Memcached, in-memory, etc.

```typescript
// packages/api/src/interfaces/cache-provider.ts

export interface CacheProvider {
  /** Get value by key */
  get<T>(key: string): Promise<T | null>;

  /** Set value with optional TTL in seconds */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /** Delete key */
  delete(key: string): Promise<boolean>;

  /** Check if key exists */
  exists(key: string): Promise<boolean>;

  /** Get multiple keys */
  getMany<T>(keys: string[]): Promise<Map<string, T>>;

  /** Set multiple keys */
  setMany<T>(entries: Map<string, T>, ttlSeconds?: number): Promise<void>;

  /** Delete multiple keys */
  deleteMany(keys: string[]): Promise<number>;

  /** Delete keys matching pattern (e.g., "user:*") */
  deletePattern(pattern: string): Promise<number>;

  /** Clear all cache (use carefully) */
  flush(): Promise<void>;

  /** Graceful shutdown */
  close(): Promise<void>;
}
```

#### 4.2.4 Search Provider Interface

Abstracts search functionality. Can be implemented with Postgres FTS, Elasticsearch, Meilisearch, Typesense, etc.

```typescript
// packages/api/src/interfaces/search-provider.ts

export interface SearchDocument {
  title: string;
  content: string;
  tags: string[];
  nodeType: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface SearchOptions {
  /** Maximum results to return */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Filter by tags (AND logic) */
  tags?: string[];
  /** Filter by node types */
  nodeTypes?: string[];
  /** Date range filter */
  dateRange?: { from?: Date; to?: Date };
  /** Sort order */
  sort?: 'relevance' | 'date_desc' | 'date_asc';
}

export interface SearchResult {
  id: string;
  score: number;
  highlights?: {
    title?: string;
    content?: string;
  };
}

export interface SearchProvider {
  /** Index a document */
  index(id: string, document: SearchDocument): Promise<void>;

  /** Update an indexed document */
  update(id: string, document: Partial<SearchDocument>): Promise<void>;

  /** Remove document from index */
  remove(id: string): Promise<void>;

  /** Search with query string */
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;

  /** Bulk index multiple documents */
  bulkIndex(documents: Array<{ id: string; doc: SearchDocument }>): Promise<void>;

  /** Reindex all documents (rebuild index) */
  reindexAll(documents: Array<{ id: string; doc: SearchDocument }>): Promise<void>;

  /** Check if search service is healthy */
  healthCheck(): Promise<boolean>;
}
```

#### 4.2.5 Graph Provider Interface

Abstracts graph operations. Can be implemented with Postgres adjacency lists, Neo4j, AWS Neptune, etc.

```typescript
// packages/api/src/interfaces/graph-provider.ts

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  weight: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface GraphProvider {
  /** Add an edge between nodes */
  addEdge(
    sourceId: string,
    targetId: string,
    type: RelationType,
    weight?: number
  ): Promise<GraphEdge>;

  /** Remove an edge */
  removeEdge(edgeId: string): Promise<boolean>;

  /** Remove all edges between two nodes */
  removeEdgesBetween(sourceId: string, targetId: string): Promise<number>;

  /** Get direct neighbors of a node */
  getNeighbors(
    nodeId: string,
    options?: {
      direction?: 'in' | 'out' | 'both';
      types?: RelationType[];
      limit?: number;
    }
  ): Promise<GraphEdge[]>;

  /** Get subgraph within N hops of a node */
  getSubgraph(
    nodeId: string,
    maxDepth: number,
    options?: { types?: RelationType[] }
  ): Promise<{ nodeIds: string[]; edges: GraphEdge[] }>;

  /** Find shortest path between two nodes */
  findPath(
    sourceId: string,
    targetId: string,
    maxDepth?: number
  ): Promise<string[] | null>;

  /** Find all paths between two nodes */
  findAllPaths(
    sourceId: string,
    targetId: string,
    maxDepth?: number
  ): Promise<string[][]>;

  /** Get nodes with most connections */
  getMostConnected(limit: number): Promise<Array<{ nodeId: string; count: number }>>;

  /** Delete all edges for a node (when node is deleted) */
  deleteNodeEdges(nodeId: string): Promise<number>;
}
```

#### 4.2.6 Repository Interface

Abstracts data access. Implemented per entity type.

```typescript
// packages/api/src/interfaces/repository.ts

export interface FindOptions {
  where?: Record<string, unknown>;
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
  include?: string[]; // relations to include
}

export interface Repository<T, CreateDTO, UpdateDTO> {
  findById(id: string): Promise<T | null>;
  findOne(options: FindOptions): Promise<T | null>;
  findMany(options?: FindOptions): Promise<T[]>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<boolean>;
  count(options?: FindOptions): Promise<number>;
  exists(id: string): Promise<boolean>;
}

// Entity-specific repositories extend base
export interface NodeRepository extends Repository<KnowledgeNode, CreateNodeDTO, UpdateNodeDTO> {
  findByUserId(userId: string, options?: FindOptions): Promise<KnowledgeNode[]>;
  findByTag(userId: string, tagName: string): Promise<KnowledgeNode[]>;
  findByTags(userId: string, tagNames: string[], mode: 'and' | 'or'): Promise<KnowledgeNode[]>;
  searchFullText(userId: string, query: string, limit?: number): Promise<KnowledgeNode[]>;
  getRecentlyModified(userId: string, limit: number): Promise<KnowledgeNode[]>;
}

export interface UserRepository extends Repository<User, CreateUserDTO, UpdateUserDTO> {
  findByEmail(email: string): Promise<User | null>;
  updateLastLogin(userId: string): Promise<void>;
}

export interface ChatRepository extends Repository<ChatSession, CreateChatDTO, UpdateChatDTO> {
  findByUserId(userId: string, options?: FindOptions): Promise<ChatSession[]>;
  getMessages(sessionId: string, limit?: number, before?: Date): Promise<ChatMessage[]>;
  addMessage(sessionId: string, message: CreateMessageDTO): Promise<ChatMessage>;
  deleteWithMessages(sessionId: string): Promise<boolean>;
}
```

#### 4.2.7 Auth Provider Interface

Abstracts authentication. Can support JWT, sessions, different OAuth providers.

```typescript
// packages/api/src/interfaces/auth-provider.ts

export interface TokenPayload {
  userId: string;
  email: string;
  exp: number;
  iat: number;
  type: 'access' | 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface AuthProvider {
  /** Hash a password */
  hashPassword(password: string): Promise<string>;

  /** Verify password against hash */
  verifyPassword(password: string, hash: string): Promise<boolean>;

  /** Generate access and refresh tokens */
  generateTokens(userId: string, email: string): Promise<AuthTokens>;

  /** Verify and decode an access token */
  verifyAccessToken(token: string): Promise<TokenPayload | null>;

  /** Verify and decode a refresh token */
  verifyRefreshToken(token: string): Promise<TokenPayload | null>;

  /** Refresh tokens using a valid refresh token */
  refreshTokens(refreshToken: string): Promise<AuthTokens | null>;

  /** Revoke a refresh token (logout) */
  revokeRefreshToken(token: string): Promise<void>;

  /** Revoke all refresh tokens for a user (logout everywhere) */
  revokeAllUserTokens(userId: string): Promise<void>;
}
```

#### 4.2.8 Notification Provider Interface

Abstracts notification delivery. Can support in-app, email, push, etc.

```typescript
// packages/api/src/interfaces/notification-provider.ts

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';

export interface Notification {
  type: 'suggestion' | 'reminder' | 'system' | 'achievement';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
}

export interface NotificationProvider {
  /** Send notification to a user */
  send(
    userId: string,
    notification: Notification,
    channels: NotificationChannel[]
  ): Promise<void>;

  /** Send notification to multiple users */
  sendBatch(
    notifications: Array<{
      userId: string;
      notification: Notification;
      channels: NotificationChannel[];
    }>
  ): Promise<void>;

  /** Get user's unread in-app notifications */
  getUnread(userId: string, limit?: number): Promise<Array<Notification & { id: string; createdAt: Date }>>;

  /** Mark notification as read */
  markRead(notificationId: string): Promise<void>;

  /** Mark all as read for user */
  markAllRead(userId: string): Promise<void>;
}
```

### 4.3 Dependency Injection

We use a simple dependency injection container to wire up implementations.

```typescript
// packages/api/src/container.ts

import { Container } from 'inversify';
// Or use tsyringe, awilix, or simple factory pattern

// Interface symbols for type-safe injection
export const TYPES = {
  // Infrastructure
  JobQueue: Symbol('JobQueue'),
  LLMProvider: Symbol('LLMProvider'),
  CacheProvider: Symbol('CacheProvider'),
  SearchProvider: Symbol('SearchProvider'),
  GraphProvider: Symbol('GraphProvider'),
  AuthProvider: Symbol('AuthProvider'),
  NotificationProvider: Symbol('NotificationProvider'),

  // Repositories
  UserRepository: Symbol('UserRepository'),
  NodeRepository: Symbol('NodeRepository'),
  ChatRepository: Symbol('ChatRepository'),
  TagRepository: Symbol('TagRepository'),
  SuggestionRepository: Symbol('SuggestionRepository'),

  // Services
  AIService: Symbol('AIService'),
  NodeService: Symbol('NodeService'),
  ChatService: Symbol('ChatService'),
  SearchService: Symbol('SearchService'),
};

export interface AppConfig {
  llm: {
    provider: 'claude' | 'openai' | 'ollama';
    apiKey?: string;
    model?: string;
  };
  queue: {
    type: 'bullmq' | 'postgres' | 'sqs';
    redis?: { host: string; port: number };
  };
  cache: {
    type: 'redis' | 'memory';
    redis?: { host: string; port: number };
  };
  search: {
    type: 'postgres' | 'elasticsearch' | 'meilisearch';
  };
  graph: {
    type: 'postgres' | 'neo4j';
    neo4j?: { uri: string; user: string; password: string };
  };
}

export function createContainer(config: AppConfig): Container {
  const container = new Container();

  // === Job Queue ===
  switch (config.queue.type) {
    case 'bullmq':
      container.bind(TYPES.JobQueue).to(BullMQJobQueue).inSingletonScope();
      break;
    case 'postgres':
      container.bind(TYPES.JobQueue).to(PostgresJobQueue).inSingletonScope();
      break;
    case 'sqs':
      container.bind(TYPES.JobQueue).to(SQSJobQueue).inSingletonScope();
      break;
  }

  // === LLM Provider ===
  switch (config.llm.provider) {
    case 'claude':
      container.bind(TYPES.LLMProvider).to(ClaudeProvider).inSingletonScope();
      break;
    case 'openai':
      container.bind(TYPES.LLMProvider).to(OpenAIProvider).inSingletonScope();
      break;
    case 'ollama':
      container.bind(TYPES.LLMProvider).to(OllamaProvider).inSingletonScope();
      break;
  }

  // === Cache Provider ===
  switch (config.cache.type) {
    case 'redis':
      container.bind(TYPES.CacheProvider).to(RedisCacheProvider).inSingletonScope();
      break;
    case 'memory':
      container.bind(TYPES.CacheProvider).to(InMemoryCacheProvider).inSingletonScope();
      break;
  }

  // === Search Provider ===
  switch (config.search.type) {
    case 'postgres':
      container.bind(TYPES.SearchProvider).to(PostgresSearchProvider).inSingletonScope();
      break;
    case 'elasticsearch':
      container.bind(TYPES.SearchProvider).to(ElasticsearchProvider).inSingletonScope();
      break;
    case 'meilisearch':
      container.bind(TYPES.SearchProvider).to(MeilisearchProvider).inSingletonScope();
      break;
  }

  // === Graph Provider ===
  switch (config.graph.type) {
    case 'postgres':
      container.bind(TYPES.GraphProvider).to(PostgresGraphProvider).inSingletonScope();
      break;
    case 'neo4j':
      container.bind(TYPES.GraphProvider).to(Neo4jGraphProvider).inSingletonScope();
      break;
  }

  // === Repositories (always Postgres for MVP) ===
  container.bind(TYPES.UserRepository).to(PostgresUserRepository).inSingletonScope();
  container.bind(TYPES.NodeRepository).to(PostgresNodeRepository).inSingletonScope();
  container.bind(TYPES.ChatRepository).to(PostgresChatRepository).inSingletonScope();
  container.bind(TYPES.TagRepository).to(PostgresTagRepository).inSingletonScope();

  // === Services ===
  container.bind(TYPES.AIService).to(AIServiceImpl).inSingletonScope();
  container.bind(TYPES.NodeService).to(NodeServiceImpl).inSingletonScope();
  container.bind(TYPES.ChatService).to(ChatServiceImpl).inSingletonScope();
  container.bind(TYPES.SearchService).to(SearchServiceImpl).inSingletonScope();

  // Auth and Notification (single implementation for now)
  container.bind(TYPES.AuthProvider).to(JWTAuthProvider).inSingletonScope();
  container.bind(TYPES.NotificationProvider).to(InAppNotificationProvider).inSingletonScope();

  return container;
}
```

### 4.4 Example: Swapping Job Queue Implementation

To demonstrate swappability, here are two implementations of `JobQueue`:

**Implementation 1: BullMQ (Redis-based)**

```typescript
// packages/api/src/infrastructure/queue/bullmq-queue.ts

import { Queue, Worker, Job as BullJob } from 'bullmq';
import { injectable } from 'inversify';

@injectable()
export class BullMQJobQueue implements JobQueue {
  private queues = new Map<string, Queue>();
  private workers = new Map<string, Worker>();
  private connection = { host: 'localhost', port: 6379 };

  async enqueue<T>(type: string, payload: T, options?: JobOptions): Promise<string> {
    const queue = this.getOrCreateQueue(type);
    const job = await queue.add(type, payload, {
      delay: options?.delay,
      priority: options?.priority,
      attempts: options?.retries ?? 3,
      backoff: { type: 'exponential', delay: options?.backoff ?? 1000 },
      jobId: options?.jobId,
    });
    return job.id!;
  }

  process<T>(type: string, handler: JobHandler<T>): void {
    const worker = new Worker(
      type,
      async (job: BullJob<T>) => {
        await handler(job.data);
      },
      { connection: this.connection }
    );
    this.workers.set(type, worker);
  }

  async getJob(jobId: string): Promise<Job | null> {
    for (const queue of this.queues.values()) {
      const job = await queue.getJob(jobId);
      if (job) {
        return this.mapBullJobToJob(job);
      }
    }
    return null;
  }

  async cancel(jobId: string): Promise<boolean> {
    const job = await this.getJob(jobId);
    if (job) {
      // BullMQ remove logic
      return true;
    }
    return false;
  }

  async close(): Promise<void> {
    await Promise.all([
      ...Array.from(this.queues.values()).map((q) => q.close()),
      ...Array.from(this.workers.values()).map((w) => w.close()),
    ]);
  }

  // ... helper methods
}
```

**Implementation 2: Postgres-based (no Redis needed)**

```typescript
// packages/api/src/infrastructure/queue/postgres-queue.ts

import { Pool } from 'pg';
import { injectable, inject } from 'inversify';

@injectable()
export class PostgresJobQueue implements JobQueue {
  private handlers = new Map<string, JobHandler<unknown>>();
  private polling = false;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor(@inject('DatabasePool') private db: Pool) {}

  async enqueue<T>(type: string, payload: T, options?: JobOptions): Promise<string> {
    const result = await this.db.query(
      `INSERT INTO job_queue (id, type, payload, priority, run_at, max_attempts, status)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW() + interval '1 millisecond' * $4, $5, 'pending')
       RETURNING id`,
      [
        type,
        JSON.stringify(payload),
        options?.priority ?? 0,
        options?.delay ?? 0,
        options?.retries ?? 3,
      ]
    );
    return result.rows[0].id;
  }

  process<T>(type: string, handler: JobHandler<T>): void {
    this.handlers.set(type, handler as JobHandler<unknown>);
    this.startPolling();
  }

  private startPolling(): void {
    if (this.polling) return;
    this.polling = true;

    this.pollInterval = setInterval(async () => {
      await this.processNextJob();
    }, 1000);
  }

  private async processNextJob(): Promise<void> {
    // Claim a job atomically
    const result = await this.db.query(
      `UPDATE job_queue
       SET status = 'processing', started_at = NOW(), attempts = attempts + 1
       WHERE id = (
         SELECT id FROM job_queue
         WHERE status = 'pending' AND run_at <= NOW()
         ORDER BY priority DESC, created_at ASC
         FOR UPDATE SKIP LOCKED
         LIMIT 1
       )
       RETURNING *`
    );

    if (result.rows.length === 0) return;

    const job = result.rows[0];
    const handler = this.handlers.get(job.type);

    if (!handler) {
      await this.markFailed(job.id, 'No handler registered');
      return;
    }

    try {
      await handler(JSON.parse(job.payload));
      await this.markCompleted(job.id);
    } catch (error) {
      await this.handleFailure(job, error);
    }
  }

  private async markCompleted(jobId: string): Promise<void> {
    await this.db.query(
      `UPDATE job_queue SET status = 'completed', completed_at = NOW() WHERE id = $1`,
      [jobId]
    );
  }

  private async handleFailure(job: any, error: unknown): Promise<void> {
    if (job.attempts >= job.max_attempts) {
      await this.markFailed(job.id, String(error));
    } else {
      // Retry with backoff
      const backoff = Math.pow(2, job.attempts) * 1000;
      await this.db.query(
        `UPDATE job_queue
         SET status = 'pending', run_at = NOW() + interval '1 millisecond' * $2
         WHERE id = $1`,
        [job.id, backoff]
      );
    }
  }

  async close(): Promise<void> {
    this.polling = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  // ... other methods
}
```

**To switch implementations:** Change one config value:

```typescript
// config/default.ts
export const config: AppConfig = {
  queue: {
    type: 'postgres', // Changed from 'bullmq'
  },
  // ... rest of config
};
```

### 4.5 Testing with Interfaces

Interfaces make testing easy with mock implementations:

```typescript
// packages/api/tests/mocks/mock-job-queue.ts

export class MockJobQueue implements JobQueue {
  public jobs: Job[] = [];
  public handlers = new Map<string, JobHandler<unknown>>();

  async enqueue<T>(type: string, payload: T, options?: JobOptions): Promise<string> {
    const job: Job<T> = {
      id: `job-${this.jobs.length + 1}`,
      type,
      payload,
      status: 'pending',
      attempts: 0,
      maxAttempts: options?.retries ?? 3,
      createdAt: new Date(),
    };
    this.jobs.push(job as Job);
    return job.id;
  }

  process<T>(type: string, handler: JobHandler<T>): void {
    this.handlers.set(type, handler as JobHandler<unknown>);
  }

  // Helper for tests: process all pending jobs synchronously
  async processAll(): Promise<void> {
    for (const job of this.jobs.filter((j) => j.status === 'pending')) {
      const handler = this.handlers.get(job.type);
      if (handler) {
        await handler(job.payload);
        job.status = 'completed';
      }
    }
  }

  async getJob(jobId: string): Promise<Job | null> {
    return this.jobs.find((j) => j.id === jobId) ?? null;
  }

  async cancel(jobId: string): Promise<boolean> {
    const job = this.jobs.find((j) => j.id === jobId);
    if (job && job.status === 'pending') {
      job.status = 'failed';
      return true;
    }
    return false;
  }

  async close(): Promise<void> {}
  async pause(): Promise<void> {}
  async resume(): Promise<void> {}
  async getJobs(): Promise<Job[]> {
    return this.jobs;
  }
}
```

```typescript
// Example test using mock
describe('SuggestionService', () => {
  let suggestionService: SuggestionService;
  let mockQueue: MockJobQueue;

  beforeEach(() => {
    mockQueue = new MockJobQueue();
    suggestionService = new SuggestionService(mockQueue, mockLLMProvider, mockNodeRepo);
  });

  it('enqueues categorization job after node creation', async () => {
    await suggestionService.queueCategorization('node-123', 'Some content');

    expect(mockQueue.jobs).toHaveLength(1);
    expect(mockQueue.jobs[0].type).toBe('categorize');
    expect(mockQueue.jobs[0].payload).toEqual({
      nodeId: 'node-123',
      content: 'Some content',
    });
  });
});
```

---

## 5. Architecture Overview

### 5.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    React Application                        ││
│  │  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐ ││
│  │  │   Chat   │  │ Graph View   │  │  Knowledge Explorer   │ ││
│  │  │Interface │  │(Force-directed)│ │  (Search + Browse)    │ ││
│  │  └──────────┘  └──────────────┘  └───────────────────────┘ ││
│  │                         │                                   ││
│  │              ┌──────────┴──────────┐                       ││
│  │              │  React Query + API  │                       ││
│  │              │       Client        │                       ││
│  │              └──────────┬──────────┘                       ││
│  └─────────────────────────┼───────────────────────────────────┘│
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTPS/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Node.js API Server                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    REST Endpoints                           ││
│  │  /auth  /nodes  /chat  /search  /graph  /suggestions        ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────────┐ │
│  │   Auth Service │  │  Chat Service  │  │  Search Service   │ │
│  └────────────────┘  └────────────────┘  └───────────────────┘ │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────────┐ │
│  │  Node Service  │  │  LLM Service   │  │  Graph Service    │ │
│  │                │  │  (abstracted)  │  │                   │ │
│  └────────────────┘  └────────────────┘  └───────────────────┘ │
│                              │                                  │
│                     ┌────────┴────────┐                        │
│                     │   Job Queue     │                        │
│                     │ (async AI jobs) │                        │
│                     └────────┬────────┘                        │
└──────────────────────────────┼──────────────────────────────────┘
                               │
        ┌──────────────────────┼─────────────────────┐
        │                      │                     │
        ▼                      ▼                     ▼
┌───────────────┐    ┌─────────────────┐    ┌───────────────┐
│  PostgreSQL   │    │   Neo4j (opt)   │    │  Claude API   │
│               │    │                 │    │               │
│ • Users       │    │ • Relationships │    │ • Categorize  │
│ • Nodes       │    │ • Graph queries │    │ • Summarize   │
│ • Chat history│    │                 │    │ • Suggest     │
│ • Tags        │    │                 │    │               │
│ • Audit log   │    │                 │    │               │
└───────────────┘    └─────────────────┘    └───────────────┘
```

### 5.2 Data Flow: Adding Knowledge

```
User types in chat
        │
        ▼
Chat saved to database
        │
        ▼
AI extracts knowledge nuggets from conversation
        │
        ▼
For each nugget:
    ├─→ AI suggests: category, tags, related nodes
    │
    ▼
Suggestions queued for user review
        │
        ▼
User reviews & confirms/modifies
        │
        ▼
Node created with final structure
        │
        ▼
Async job triggered: find new connections, update suggestions
```

### 5.3 API Endpoints (Draft)

```
Authentication
  POST   /api/auth/register          # Create account
  POST   /api/auth/login             # Get JWT token
  POST   /api/auth/logout            # Invalidate token
  GET    /api/auth/me                # Current user info

Chat
  GET    /api/chat/sessions          # List chat sessions
  GET    /api/chat/sessions/:id      # Get session with messages
  POST   /api/chat/sessions          # Start new session
  POST   /api/chat/sessions/:id/messages  # Send message
  DELETE /api/chat/sessions/:id      # Delete session + related data

Knowledge Nodes
  GET    /api/nodes                  # List nodes (paginated, filterable)
  GET    /api/nodes/:id              # Get single node with relations
  POST   /api/nodes                  # Create node
  PUT    /api/nodes/:id              # Update node
  DELETE /api/nodes/:id              # Delete node
  POST   /api/nodes/:id/relations    # Add relation to another node
  DELETE /api/nodes/:id/relations/:relId  # Remove relation

Search
  GET    /api/search                 # Unified search (keyword, tags)
  POST   /api/search/natural         # Natural language search (AI-powered)
  GET    /api/search/related/:id     # Find related nodes

Graph
  GET    /api/graph                  # Get full graph structure for visualization
  GET    /api/graph/subgraph/:id     # Get subgraph centered on node

Suggestions
  GET    /api/suggestions            # Pending AI suggestions
  POST   /api/suggestions/:id/accept # Accept suggestion
  POST   /api/suggestions/:id/reject # Reject suggestion
  POST   /api/suggestions/:id/modify # Modify and accept

User Settings
  GET    /api/settings               # Get user preferences
  PUT    /api/settings               # Update preferences (notifications, etc.)
```

---

## 6. Data Model

### 6.1 PostgreSQL Schema

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings/preferences
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    notification_preferences JSONB DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    interests TEXT[], -- for seeding suggestions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge nodes
CREATE TABLE nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    node_type VARCHAR(50) DEFAULT 'note', -- concept, question, note, link, etc.
    source_url TEXT, -- if captured from external source
    metadata JSONB DEFAULT '{}', -- flexible additional data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nodes_user_id ON nodes(user_id);
CREATE INDEX idx_nodes_created_at ON nodes(created_at DESC);

-- Full-text search index
ALTER TABLE nodes ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(content, '')), 'B')
    ) STORED;
CREATE INDEX idx_nodes_search ON nodes USING GIN(search_vector);

-- Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7), -- hex color
    UNIQUE(user_id, name)
);

-- Node-Tag junction
CREATE TABLE node_tags (
    node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (node_id, tag_id)
);

-- Node relationships (for graph without Neo4j)
CREATE TABLE node_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) DEFAULT 'related', -- related, parent, child, derived_from, etc.
    strength FLOAT DEFAULT 1.0, -- relationship strength (0-1)
    ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_node_id, target_node_id, relation_type)
);

CREATE INDEX idx_relations_source ON node_relations(source_node_id);
CREATE INDEX idx_relations_target ON node_relations(target_node_id);

-- Chat sessions
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- extracted knowledge refs, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON chat_messages(session_id, created_at);

-- AI suggestions queue
CREATE TABLE suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    suggestion_type VARCHAR(50) NOT NULL, -- 'categorize', 'merge', 'split', 'connect', 'learn_next'
    payload JSONB NOT NULL, -- type-specific data
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
    source_node_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_suggestions_user_pending ON suggestions(user_id, status) WHERE status = 'pending';

-- Audit log (for future versioning)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'node', 'tag', 'relation'
    entity_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'create', 'update', 'delete'
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);
```

### 6.2 TypeScript Types (Shared Package)

```typescript
// packages/shared/src/types/index.ts

// === Base Types ===

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  userId: string;
  notificationPreferences: NotificationPreferences;
  onboardingCompleted: boolean;
  interests: string[];
}

export interface NotificationPreferences {
  suggestionAlerts: boolean; // in-app
  emailDigest: 'none' | 'daily' | 'weekly';
  browserPush: boolean;
}

// === Knowledge Graph ===

export type NodeType = 'concept' | 'note' | 'question' | 'link' | 'idea';

export interface KnowledgeNode {
  id: string;
  userId: string;
  title: string;
  content: string | null;
  nodeType: NodeType;
  sourceUrl: string | null;
  metadata: Record<string, unknown>;
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string | null;
}

export type RelationType =
  | 'related'      // general relationship
  | 'parent'       // hierarchical parent
  | 'child'        // hierarchical child
  | 'derived_from' // built upon
  | 'contradicts'  // opposing information
  | 'example_of';  // illustrates

export interface NodeRelation {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: RelationType;
  strength: number; // 0-1
  aiGenerated: boolean;
  createdAt: Date;
}

// === Chat ===

export interface ChatSession {
  id: string;
  userId: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: ChatMessageMetadata;
  createdAt: Date;
}

export interface ChatMessageMetadata {
  extractedNodeIds?: string[];  // nodes created from this message
  suggestionIds?: string[];     // suggestions generated
}

// === AI Suggestions ===

export type SuggestionType =
  | 'categorize'   // place new content
  | 'merge'        // combine duplicate nodes
  | 'split'        // break apart complex node
  | 'connect'      // create relationship
  | 'learn_next';  // topic suggestion

export type SuggestionStatus = 'pending' | 'accepted' | 'rejected';

export interface Suggestion<T = unknown> {
  id: string;
  userId: string;
  suggestionType: SuggestionType;
  payload: T;
  status: SuggestionStatus;
  sourceNodeId: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
}

// Type-specific payloads
export interface CategorizeSuggestion {
  content: string;
  suggestedTitle: string;
  suggestedTags: string[];
  suggestedRelations: Array<{
    targetNodeId: string;
    relationType: RelationType;
    reason: string;
  }>;
  confidence: number;
}

export interface MergeSuggestion {
  nodeIds: string[];
  reason: string;
  suggestedTitle: string;
  suggestedContent: string;
}

export interface ConnectSuggestion {
  sourceNodeId: string;
  targetNodeId: string;
  relationType: RelationType;
  reason: string;
  confidence: number;
}

export interface LearnNextSuggestion {
  topic: string;
  reason: string;
  relatedNodeIds: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// === Graph Visualization ===

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  title: string;
  nodeType: NodeType;
  tags: string[];
  // For force-directed layout
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationType: RelationType;
  strength: number;
}

// === API Types ===

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchResult {
  nodes: Array<KnowledgeNode & { relevanceScore: number }>;
  query: string;
  searchType: 'keyword' | 'natural' | 'tag';
}
```

---

## 7. Feature Specifications

### 7.1 Chat Interface

**Purpose:** Primary method for users to interact with Sage and capture knowledge.

**User Flow:**
1. User opens chat (new session or continues existing)
2. User types naturally about what they're learning
3. Sage responds conversationally, asking clarifying questions
4. Sage extracts knowledge nuggets and suggests categorization
5. User reviews and confirms/modifies suggestions
6. Chat history is preserved; user can delete if desired

**Technical Requirements:**
- Messages sent via REST POST
- AI responses streamed (if supported) or returned complete
- All messages persisted to `chat_messages` table
- AI has access to:
  - Current session messages
  - Summarized past sessions
  - User's knowledge graph structure
  - Recent nodes (for context)

**AI Prompt Context (Hybrid Memory):**
```
System context includes:
- Summary of user's knowledge domains and interests
- Recent 10 messages from current session
- Relevant nodes from knowledge graph (semantic similarity)
- Pending suggestions for this user
```

### 7.2 Knowledge Node Management

**Purpose:** Core data structure for storing user's knowledge.

**Node Schema:**
- `title` (required): Short descriptive title
- `content` (optional): Detailed notes, can be markdown
- `nodeType`: concept | note | question | link | idea
- `tags`: Array of user-defined tags
- `sourceUrl`: Optional external source
- `metadata`: Flexible JSON for future extensions

**Operations:**
- Create: Manually or from AI extraction
- Read: View single node with related nodes
- Update: Edit any field, tracked in audit log
- Delete: Soft delete initially, hard delete later (cascade to relations)

**AI Auto-categorization:**
- Triggered when new content added via chat
- AI suggests: title, tags, parent nodes, related nodes
- **Always requires user confirmation** before applying
- Suggestions expire after 7 days if not acted upon

### 7.3 Knowledge Graph

**Purpose:** Visualize and navigate relationships between nodes.

**Data Structure (Postgres-only MVP):**
- Nodes stored in `nodes` table
- Relationships in `node_relations` table
- Query using recursive CTEs for traversal

**Relationship Types:**
- `related`: General connection
- `parent/child`: Hierarchical structure
- `derived_from`: Built upon another concept
- `contradicts`: Conflicting information
- `example_of`: Illustrates a concept

**Graph Queries:**
```sql
-- Get all nodes related to a given node (1 hop)
SELECT n.*, r.relation_type, r.strength
FROM nodes n
JOIN node_relations r ON n.id = r.target_node_id
WHERE r.source_node_id = $1

-- Get subgraph (2 hops) for visualization
WITH RECURSIVE subgraph AS (
  SELECT id, 0 as depth FROM nodes WHERE id = $1
  UNION
  SELECT n.id, sg.depth + 1
  FROM nodes n
  JOIN node_relations r ON n.id = r.target_node_id OR n.id = r.source_node_id
  JOIN subgraph sg ON sg.id = r.source_node_id OR sg.id = r.target_node_id
  WHERE sg.depth < 2
)
SELECT DISTINCT n.* FROM nodes n JOIN subgraph sg ON n.id = sg.id;
```

### 7.4 Graph Visualization

**Purpose:** Interactive visual exploration of knowledge.

**Implementation:**
- Library: D3.js force-directed graph OR react-force-graph
- Features:
  - Pan, zoom, drag nodes
  - Click node to view details
  - Color-code by node type or tags
  - Highlight paths between nodes
  - Filter by tags or date range

**Performance Considerations:**
- Limit initial render to ~500 nodes
- Use WebGL renderer for large graphs (via react-force-graph)
- Load subgraphs on demand

### 7.5 Search

**Three Search Modes:**

1. **Keyword Search** (Postgres full-text)
   - Fast, searches title and content
   - Supports boolean operators
   ```sql
   SELECT *, ts_rank(search_vector, query) as rank
   FROM nodes, plainto_tsquery('english', $1) query
   WHERE search_vector @@ query
   ORDER BY rank DESC;
   ```

2. **Tag Search**
   - Filter by one or more tags
   - Combine with keyword search

3. **Natural Language Search** (AI-powered)
   - User asks: "What do I know about X?"
   - AI interprets query, finds relevant nodes
   - Returns ranked results with explanations
   - Higher latency, use sparingly

4. **Graph Traversal**
   - "Show me everything related to X"
   - Navigate by following relationships
   - Visualize as expanding subgraph

### 7.6 AI Suggestions

**Suggestion Types:**

1. **Categorize**: Place new knowledge in graph
   - Triggered: After chat extraction
   - Shows: Suggested title, tags, relations
   - User: Accept/modify/reject

2. **Connect**: Discover relationships
   - Triggered: After node creation (async)
   - Shows: Potential connections with reasons
   - User: Accept/reject each

3. **Merge**: Combine duplicates
   - Triggered: Periodic scan or on-demand
   - Shows: Similar nodes, combined preview
   - User: Accept/reject

4. **Learn Next**: Topic suggestions
   - Triggered: User request or periodic
   - Shows: Suggested topics based on gaps
   - User: Explore or dismiss

**Processing:**
- Async job queue (Bull/BullMQ with Redis, or simple Postgres-based queue)
- Runs after each knowledge addition
- Rate limited to control API costs

### 7.7 User Onboarding

**Flow:**
1. Sign up with email/password
2. Welcome screen with overview
3. **Option to skip** → empty state
4. **Guided tutorial:**
   - Add your first knowledge piece
   - See how AI categorizes it
   - Explore the graph view
5. **Seed interests** (optional):
   - Select topics of interest
   - Pre-populate suggested areas
   - Creates initial graph structure

### 7.8 Authentication

**MVP: Email/Password**
- bcrypt for password hashing
- JWT tokens (short-lived access + refresh token)
- Secure HTTP-only cookies

**Phase 2: OAuth Providers**
- Google, GitHub at minimum
- Passport.js or similar library
- Link OAuth to existing email account

---

## 8. AI Integration

### 8.1 LLM Abstraction Layer

Design for provider portability:

```typescript
// packages/api/src/llm/types.ts
export interface LLMProvider {
  chat(messages: Message[], options?: ChatOptions): Promise<string>;
  categorize(content: string, context: CategorizeContext): Promise<CategorizeSuggestion>;
  findConnections(node: KnowledgeNode, candidates: KnowledgeNode[]): Promise<ConnectSuggestion[]>;
  summarize(nodes: KnowledgeNode[]): Promise<string>;
  suggestLearning(graph: GraphData, interests: string[]): Promise<LearnNextSuggestion[]>;
}

export interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface CategorizeContext {
  existingTags: Tag[];
  existingNodes: KnowledgeNode[]; // sample for context
  userInterests: string[];
}
```

```typescript
// packages/api/src/llm/claude.ts
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeProvider implements LLMProvider {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514', // or configurable
      max_tokens: options?.maxTokens ?? 1024,
      system: options?.systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });
    return response.content[0].text;
  }

  async categorize(content: string, context: CategorizeContext): Promise<CategorizeSuggestion> {
    // Structured prompt for categorization
    const prompt = buildCategorizationPrompt(content, context);
    const response = await this.chat([{ role: 'user', content: prompt }], {
      systemPrompt: CATEGORIZATION_SYSTEM_PROMPT,
    });
    return parseCategorizationResponse(response);
  }

  // ... other methods
}
```

### 8.2 AI Memory Strategy (Hybrid)

When generating AI responses, include:

1. **Summarized History**
   - Periodic summary of user's knowledge domains
   - Updated weekly or after significant additions
   - Stored in `user_settings.metadata`

2. **Full Knowledge Graph Structure**
   - Tags and node titles (not full content)
   - Relationship map
   - Provides structural context

3. **Recent Context**
   - Last 10 messages from current session
   - Last 5 nodes created/modified
   - Pending suggestions

4. **Semantic Retrieval** (future enhancement)
   - Embed user query
   - Retrieve top-k similar nodes
   - Include in context

### 8.3 Rate Limiting & Cost Control

```typescript
// Rate limiting configuration
const rateLimits = {
  categorization: {
    maxPerMinute: 10,
    maxPerDay: 100,
  },
  chat: {
    maxPerMinute: 20,
    maxPerDay: 500,
  },
  search: {
    maxPerMinute: 5,
    maxPerDay: 50,
  },
};
```

- Implement per-user rate limits
- Queue requests during high load
- Track API costs per user (for future billing)
- Use Claude Haiku for simple operations (cost optimization)

### 8.4 Graceful Degradation

When AI API fails or rate limited:

1. **Chat:** Return error message, allow retry
2. **Categorization:** Save content without AI suggestions, queue for later
3. **Connections:** Skip, run on next batch
4. **Search:** Fall back to keyword search only

Store failed requests in queue table:
```sql
CREATE TABLE failed_ai_requests (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    request_type VARCHAR(50),
    payload JSONB,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    next_retry_at TIMESTAMPTZ
);
```

---

## 9. Security & Privacy

### 9.1 Security Model

**Standard Enterprise Security** (not E2E encrypted):
- Encryption at rest (database level)
- Encryption in transit (TLS/HTTPS)
- Strong access controls
- Audit logging

### 9.2 Authentication Security

- Passwords hashed with bcrypt (cost factor 12)
- JWT access tokens (15 min expiry)
- Refresh tokens (7 day expiry, stored in DB, rotated on use)
- HTTP-only secure cookies for token storage
- CSRF protection for state-changing operations

### 9.3 Authorization

- All resources scoped to user ID
- Middleware validates user owns resource before access
- No cross-user data access possible

```typescript
// Example middleware
async function requireOwnership(req, res, next) {
  const node = await nodeRepository.findById(req.params.id);
  if (!node) return res.status(404).json({ error: 'Not found' });
  if (node.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  req.node = node;
  next();
}
```

### 9.4 Data Protection

- No PII shared with LLM beyond content user provides
- API keys stored in environment variables (not in code)
- Database credentials rotated quarterly
- Regular security audits (future)

### 9.5 Audit Logging

Track security-relevant events:
- Login attempts (success/failure)
- Password changes
- Data exports
- Bulk deletions

---

## 10. Testing Strategy

### 10.1 Testing Pyramid

```
        ┌───────────────┐
        │    E2E (10%)  │  Playwright: critical user flows
        ├───────────────┤
        │Integration(30)│  API tests, DB integration
        ├───────────────┤
        │  Unit (60%)   │  Vitest: services, utilities
        └───────────────┘
```

### 10.2 Unit Tests (Vitest)

- All service methods
- Utility functions
- LLM prompt builders
- Data transformations

```typescript
// Example: nodeService.test.ts
describe('NodeService', () => {
  it('creates node with valid data', async () => {
    const node = await nodeService.create({
      userId: 'user-1',
      title: 'Test Node',
      content: 'Content here',
      nodeType: 'note',
    });
    expect(node.id).toBeDefined();
    expect(node.title).toBe('Test Node');
  });

  it('throws on missing title', async () => {
    await expect(nodeService.create({
      userId: 'user-1',
      content: 'No title',
    })).rejects.toThrow('Title is required');
  });
});
```

### 10.3 Integration Tests

- API endpoint tests with real database (test container)
- LLM integration with mocked responses
- Authentication flows

```typescript
// Example: nodes.api.test.ts
describe('POST /api/nodes', () => {
  it('creates node for authenticated user', async () => {
    const response = await request(app)
      .post('/api/nodes')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ title: 'New Node', content: 'Test content' });

    expect(response.status).toBe(201);
    expect(response.body.node.title).toBe('New Node');
  });

  it('returns 401 without auth', async () => {
    const response = await request(app)
      .post('/api/nodes')
      .send({ title: 'New Node' });

    expect(response.status).toBe(401);
  });
});
```

### 10.4 E2E Tests (Playwright)

Critical user journeys:
- Sign up → onboarding → first knowledge
- Chat interaction → knowledge extraction
- Search and navigation
- Graph visualization interaction

### 10.5 Test Data

- Factory functions for creating test entities
- Seed scripts for development database
- Isolated test database per test run

### 10.6 Testing Infrastructure

**Database Strategy: Same Container, Separate Database**

Tests run against a dedicated `sage_test` database in the same Postgres container used for development. This keeps the setup simple while ensuring test isolation.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Postgres Container (:5432)                    │
│                                                                  │
│   ┌─────────────────────────┐  ┌─────────────────────────┐      │
│   │      sage (dev)         │  │    sage_test (test)     │      │
│   │                         │  │                         │      │
│   │  Your development data  │  │  Reset before each run  │      │
│   │  persists across runs   │  │  isolated test data     │      │
│   └─────────────────────────┘  └─────────────────────────┘      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Test Database Configuration:**

```typescript
// packages/api/src/config/database.ts
export const getDatabaseConfig = () => ({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432'),
  database: process.env.NODE_ENV === 'test'
    ? 'sage_test'
    : (process.env.DB_NAME ?? 'sage'),
  user: process.env.DB_USER ?? 'sage',
  password: process.env.DB_PASSWORD ?? 'sage_dev',
});
```

**Test Database Setup Script:**

```bash
#!/bin/bash
# scripts/setup-test-db.sh

# Create test database if it doesn't exist
docker exec sage-postgres psql -U sage -c "CREATE DATABASE sage_test;" 2>/dev/null || true

# Run migrations on test database
DATABASE_URL="postgresql://sage:sage_dev@localhost:5432/sage_test" npm run migrate
```

**Resetting Between Test Runs:**

```typescript
// packages/api/tests/setup.ts
import { Pool } from 'pg';

export async function resetTestDatabase(pool: Pool): Promise<void> {
  // Truncate all tables in reverse dependency order
  await pool.query(`
    TRUNCATE TABLE
      audit_log,
      suggestions,
      chat_messages,
      chat_sessions,
      node_relations,
      node_tags,
      nodes,
      tags,
      user_settings,
      users
    CASCADE;
  `);
}

// In vitest.config.ts or test setup
beforeEach(async () => {
  await resetTestDatabase(testPool);
});
```

**Running Tests:**

```bash
# Ensure test DB exists (one-time setup)
npm run setup:test-db

# Run unit tests (no DB needed, mocked)
npm run test:unit

# Run integration tests (uses sage_test DB)
npm run test:integration

# Run all tests
npm run test
```

---

## 11. Infrastructure & Deployment

### 11.1 Local Development

**Architecture: Docker for Infrastructure, Native for Code**

Docker containers run **infrastructure services only** (databases, cache). Application code runs **natively** on your machine with hot reloading for fast development iteration.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Developer Machine                             │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                 Native (Hot Reload)                          │   │
│   │                                                              │   │
│   │   ┌─────────────────┐      ┌─────────────────┐              │   │
│   │   │   packages/api  │      │   packages/web  │              │   │
│   │   │   npm run dev   │      │   npm run dev   │              │   │
│   │   │   Port 3000     │      │   Port 5173     │              │   │
│   │   └────────┬────────┘      └─────────────────┘              │   │
│   │            │                                                 │   │
│   └────────────┼─────────────────────────────────────────────────┘   │
│                │                                                      │
│   ┌────────────▼─────────────────────────────────────────────────┐   │
│   │              Docker Compose (Infrastructure Only)             │   │
│   │                                                               │   │
│   │   ┌───────────┐    ┌───────────┐    ┌───────────┐           │   │
│   │   │ Postgres  │    │   Redis   │    │   Neo4j   │           │   │
│   │   │   :5432   │    │   :6379   │    │   :7687   │           │   │
│   │   └───────────┘    └───────────┘    └───────────┘           │   │
│   │                                                               │   │
│   └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Why this split?**
- **Fast iteration**: No container rebuild on code changes
- **Native debugging**: Use IDE debuggers directly
- **Hot module replacement**: Instant feedback on frontend changes
- **Simpler workflow**: Only restart containers when changing infrastructure

**Docker Compose Stack (Infrastructure):**

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: sage
      POSTGRES_PASSWORD: sage_dev
      POSTGRES_DB: sage
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  neo4j:
    image: neo4j:5
    environment:
      NEO4J_AUTH: neo4j/sage_dev
    ports:
      - "7474:7474"  # HTTP
      - "7687:7687"  # Bolt
    volumes:
      - neo4j_data:/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  neo4j_data:
```

**Development Commands:**
```bash
# Start infrastructure (databases only)
docker compose -f docker/docker-compose.yml up -d

# Run API in dev mode (native, with hot reload)
cd packages/api && npm run dev

# Run frontend in dev mode (native, with HMR)
cd packages/web && npm run dev

# Run all tests
npm run test

# Run E2E tests
npm run test:e2e
```

### 11.2 Production Deployment (AWS - Future)

**Architecture:**
- ECS Fargate for API containers
- RDS PostgreSQL (db.t3.micro → db.t3.small as needed)
- S3 + CloudFront for frontend static files
- ElastiCache Redis for job queue
- Neo4j AuraDB (free tier initially)
- CloudWatch for logs and monitoring

**CDK Stack Structure:**
```
cdk/
├── lib/
│   ├── network-stack.ts    # VPC, subnets
│   ├── database-stack.ts   # RDS, Redis
│   ├── api-stack.ts        # ECS Fargate
│   └── frontend-stack.ts   # S3, CloudFront
└── bin/
    └── sage.ts             # App entry
```

**Cost Optimization:**
- Use Fargate Spot for non-critical workloads
- Schedule dev environment shutdown overnight
- RDS reserved instances when usage stabilizes
- CloudFront caching to reduce origin requests

### 11.3 CI/CD Pipeline

**GitHub Actions with Built-in Services**

GitHub Actions provides Postgres and Redis as built-in services at no extra cost. This gives us ~200-400 free test runs per month on the free tier (2,000 minutes/month, ~5-10 min per run).

**Example Workflow:**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: sage
          POSTGRES_PASSWORD: sage_test
          POSTGRES_DB: sage_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npm run migrate
        env:
          DATABASE_URL: postgresql://sage:sage_test@localhost:5432/sage_test

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://sage:sage_test@localhost:5432/sage_test
          REDIS_URL: redis://localhost:6379

      - name: Build packages
        run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: test  # Only run E2E if unit/integration pass

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: sage
          POSTGRES_PASSWORD: sage_test
          POSTGRES_DB: sage_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run migrations
        run: npm run migrate
        env:
          DATABASE_URL: postgresql://sage:sage_test@localhost:5432/sage_test

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://sage:sage_test@localhost:5432/sage_test
```

**Cost Notes:**
- GitHub Free tier: 2,000 minutes/month
- Typical CI run: 5-10 minutes
- Expected capacity: ~200-400 runs/month
- For higher volume, consider self-hosted runners or GitHub Team plan

**GitHub Environments & Deployment Management**

GitHub provides a UI for managing deployments at **Settings → Environments**. Configure two environments:

| Environment | Trigger | Protection Rules | Secrets |
|-------------|---------|------------------|---------|
| `staging` | Auto on merge to `main` | None | AWS creds (staging) |
| `production` | Manual approval or release tag | Required reviewer | AWS creds (prod) |

The deployment pipeline:

```
merge to main ──▶ staging (auto) ──▶ smoke tests ──▶ ✓
                                                     │
                       ┌─────────────────────────────┘
                       ▼
              [Manual approval in GitHub UI]
                       │
                       ▼
              production deploy ──▶ smoke tests ──▶ health check
```

**Where to find things in GitHub:**

| Task | Location |
|------|----------|
| View pipeline runs | **Actions** tab |
| See logs for failures | Actions → click run → click failed job |
| Configure environment secrets | **Settings → Environments** → select env |
| Require approval for prod | Settings → Environments → Protection rules |
| View deployment history | **Code → Deployments** |
| Approve a production deploy | Actions → click waiting run → Review deployments |

### 11.4 Production Containerization

**Development vs Production Strategy**

| Environment | App Code | Infrastructure |
|-------------|----------|----------------|
| Development | Native (hot reload) | Docker containers |
| CI/CD | Native (in runner) | GitHub Actions services |
| Production | Docker containers | Managed services (RDS, etc.) |

In production, the application code runs in containers while infrastructure uses managed services for reliability and scalability.

**Example API Dockerfile:**

```dockerfile
# docker/Dockerfile.api
# Multi-stage build for minimal production image

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace config
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci --workspace=packages/api --workspace=packages/shared

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/api ./packages/api
COPY tsconfig.base.json ./

# Build
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=packages/api

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/shared/package*.json ./packages/shared/

# Install production dependencies only
RUN npm ci --workspace=packages/api --workspace=packages/shared --omit=dev

# Copy built artifacts
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/api/dist ./packages/api/dist

# Run as non-root user
USER node

EXPOSE 3000

CMD ["node", "packages/api/dist/index.js"]
```

**Build and Deploy Flow:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CI/CD Pipeline                                │
│                                                                      │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────────────┐  │
│   │  Test   │───▶│  Build  │───▶│  Push   │───▶│     Deploy      │  │
│   │         │    │ Docker  │    │   to    │    │   to ECS/K8s    │  │
│   │ (native)│    │  Image  │    │   ECR   │    │                 │  │
│   └─────────┘    └─────────┘    └─────────┘    └─────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Why containerize for production but not development?**
- **Production**: Containers ensure consistent deployments, easy scaling, and rollbacks
- **Development**: Native execution enables faster iteration and easier debugging
- **Both benefit**: Same code, different execution contexts optimized for each use case

---

## 12. Development Phases

### Phase 1: MVP (No deadline - quality first)

**Deliverables:**
1. Project scaffolding (monorepo, TypeScript config)
2. Local Docker development environment
3. PostgreSQL schema and migrations
4. Basic authentication (email/password, JWT)
5. CRUD API for knowledge nodes
6. Basic chat interface with AI
7. AI auto-categorization (with confirmation)
8. Simple graph visualization (force-directed)
9. Keyword search
10. Full test coverage

**Definition of Done:**
- All features working locally
- Tests passing
- Documentation for setup

### Phase 2: Enhanced AI & Versioning

1. AI connection suggestions
2. Natural language search
3. Merge/split suggestions
4. Audit log (versioning foundation)
5. OAuth providers (Google, GitHub)
6. Notification system (in-app)
7. Export functionality

### Phase 3: Visualization & Access

1. Advanced graph visualization
2. Mobile-responsive web
3. PWA support (offline reading)
4. Learning path suggestions
5. Spaced repetition (optional/configurable)

### Phase 4: Collaboration (Future)

1. Multi-user architecture
2. Shared knowledge spaces
3. Role-based access
4. Real-time collaboration

---

## 13. Out of Scope for MVP

Explicitly deferred:

1. **Micro-quizzes / quiz generation** - Cut for simplicity
2. **Import from other tools** (Notion, Obsidian) - Phase 2+
3. **Mobile native apps** - Web-only for MVP
4. **PWA / offline support** - Skip for MVP
5. **Voice input** - Text-only
6. **Rich media nodes** (images, videos) - Text-only for MVP
7. **End-to-end encryption** - Using standard enterprise security
8. **Multi-user / collaboration** - Single user only
9. **Neo4j** - Start with Postgres-only, add Neo4j when needed
10. **Vector/semantic search** - Start with full-text, add later

---

## 14. Open Questions

Decisions to be made during development:

1. **Job Queue Initial Implementation:**
   - BullMQ with Redis? (more robust, requires Redis)
   - Postgres-based queue? (simpler, fewer services)
   - *Note: Interface abstraction allows easy switching later*

2. **Dependency Injection Library:**
   - InversifyJS (feature-rich, decorators)
   - tsyringe (lightweight, decorators)
   - Awilix (no decorators, auto-injection)
   - Simple factory pattern (no library)
   - Decision impacts: bundle size, learning curve, testability

3. **Session Management:**
   - How long before chat sessions auto-close?
   - Should old sessions be summarized automatically?

4. **Graph Visualization Library:**
   - D3.js (flexible but lower-level)
   - react-force-graph (higher-level, WebGL)
   - Cytoscape.js (feature-rich)
   - Decision impacts: performance, customization

5. **API Documentation:**
   - OpenAPI/Swagger?
   - Manually maintained docs?
   - Generated from code?

6. **Error Tracking:**
   - Sentry?
   - CloudWatch only?
   - Self-hosted alternative?

7. **Database Migration Tool:**
   - Prisma Migrate?
   - node-pg-migrate?
   - Custom SQL scripts?

---

## Appendix A: Name Ideas

Since "Sage" is a codename, here are alternatives to consider:

- **Sage** - Wise advisor (may keep if available)
- **Lumina** - Light/illumination of knowledge
- **Synapse** - Brain connections
- **Cortex** - Learning center of brain
- **Gnosis** - Greek for knowledge
- **Minerva** - Roman goddess of wisdom
- **Dendrite** - Branch-like neural extensions
- **Nexus** - Connection point

---

## Appendix B: Initial Prompt Templates

### Chat System Prompt

```
You are Sage, an AI learning companion. Your role is to help the user capture,
organize, and grow their knowledge.

When the user shares information:
1. Engage conversationally - ask clarifying questions
2. Help them articulate their understanding
3. Identify key concepts that should become knowledge nodes
4. Suggest connections to their existing knowledge

User's knowledge domains: {domains_summary}
Recent topics: {recent_topics}
Current context: {current_session_summary}

Be concise but thorough. Ask one question at a time. Focus on understanding
before organizing.
```

### Categorization Prompt

```
Analyze the following content and suggest how it should be organized in the
user's knowledge graph.

Content: {content}

User's existing tags: {tags}
Sample existing nodes: {sample_nodes}

Respond in JSON format:
{
  "suggestedTitle": "...",
  "suggestedTags": ["...", "..."],
  "suggestedRelations": [
    {
      "targetNodeId": "...",
      "relationType": "related|parent|child|derived_from|example_of",
      "reason": "..."
    }
  ],
  "confidence": 0.0-1.0
}
```

---

*End of Technical Specification*

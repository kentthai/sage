import type {
  User,
  KnowledgeEntry,
  Concept,
  Conversation,
  ReviewSession,
  PaginationParams,
  PaginatedResponse,
} from '@sage/shared';

/**
 * Base repository interface with common CRUD operations
 */
export interface IRepository<T, CreateDTO, UpdateDTO> {
  findById(id: string): Promise<T | null>;
  findMany(options?: FindManyOptions): Promise<T[]>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<void>;
  count(filter?: Record<string, unknown>): Promise<number>;
}

export interface FindManyOptions {
  filter?: Record<string, unknown>;
  orderBy?: OrderBy;
  pagination?: PaginationParams;
}

export interface OrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// User Repository
// ============================================================================

export interface IUserRepository
  extends IRepository<User, CreateUserDTO, UpdateUserDTO> {
  findByEmail(email: string): Promise<User | null>;
  updatePreferences(
    userId: string,
    preferences: Partial<User['preferences']>
  ): Promise<User>;
}

export interface CreateUserDTO {
  email: string;
  name: string;
  preferences?: Partial<User['preferences']>;
}

export interface UpdateUserDTO {
  email?: string;
  name?: string;
  preferences?: Partial<User['preferences']>;
}

// ============================================================================
// Knowledge Entry Repository
// ============================================================================

export interface IKnowledgeEntryRepository
  extends IRepository<KnowledgeEntry, CreateEntryDTO, UpdateEntryDTO> {
  findByUser(
    userId: string,
    options?: FindManyOptions
  ): Promise<PaginatedResponse<KnowledgeEntry>>;
  findByTags(
    userId: string,
    tags: string[]
  ): Promise<KnowledgeEntry[]>;
  findDueForReview(
    userId: string,
    limit?: number
  ): Promise<KnowledgeEntry[]>;
  updateRetentionScore(
    entryId: string,
    score: number
  ): Promise<KnowledgeEntry>;
  recordReview(
    entryId: string,
    nextReviewAt: Date
  ): Promise<KnowledgeEntry>;
}

export interface CreateEntryDTO {
  userId: string;
  content: string;
  summary?: string;
  sourceType: KnowledgeEntry['sourceType'];
  sourceUrl?: string;
  tags?: string[];
  concepts?: Array<{ conceptId: string; relevance: number }>;
}

export interface UpdateEntryDTO {
  content?: string;
  summary?: string;
  tags?: string[];
  concepts?: Array<{ conceptId: string; relevance: number }>;
}

// ============================================================================
// Concept Repository
// ============================================================================

export interface IConceptRepository
  extends IRepository<Concept, CreateConceptDTO, UpdateConceptDTO> {
  findByUser(userId: string): Promise<Concept[]>;
  findByName(userId: string, name: string): Promise<Concept | null>;
  findByAlias(userId: string, alias: string): Promise<Concept | null>;
  incrementEntryCount(conceptId: string): Promise<Concept>;
  decrementEntryCount(conceptId: string): Promise<Concept>;
}

export interface CreateConceptDTO {
  userId: string;
  name: string;
  description?: string;
  aliases?: string[];
}

export interface UpdateConceptDTO {
  name?: string;
  description?: string;
  aliases?: string[];
}

// ============================================================================
// Conversation Repository
// ============================================================================

export interface IConversationRepository
  extends IRepository<Conversation, CreateConversationDTO, UpdateConversationDTO> {
  findByUser(
    userId: string,
    options?: FindManyOptions
  ): Promise<PaginatedResponse<Conversation>>;
  addMessage(
    conversationId: string,
    message: Conversation['messages'][number]
  ): Promise<Conversation>;
  linkEntry(
    conversationId: string,
    entryId: string
  ): Promise<Conversation>;
}

export interface CreateConversationDTO {
  userId: string;
  title?: string;
  messages?: Conversation['messages'];
}

export interface UpdateConversationDTO {
  title?: string;
}

// ============================================================================
// Review Session Repository
// ============================================================================

export interface IReviewSessionRepository
  extends IRepository<ReviewSession, CreateReviewSessionDTO, UpdateReviewSessionDTO> {
  findByUser(
    userId: string,
    options?: FindManyOptions
  ): Promise<PaginatedResponse<ReviewSession>>;
  findActiveSession(userId: string): Promise<ReviewSession | null>;
  recordItemResponse(
    sessionId: string,
    entryId: string,
    response: ReviewSession['items'][number]['response'],
    responseTime: number
  ): Promise<ReviewSession>;
  completeSession(sessionId: string): Promise<ReviewSession>;
}

export interface CreateReviewSessionDTO {
  userId: string;
  items: Array<{ entryId: string }>;
}

export interface UpdateReviewSessionDTO {
  completedAt?: Date;
}

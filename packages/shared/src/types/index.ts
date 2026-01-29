// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  dailyDigestTime?: string; // HH:mm format
  timezone: string;
}

// ============================================================================
// Knowledge Entry Types
// ============================================================================

export interface KnowledgeEntry {
  id: string;
  userId: string;
  content: string;
  summary?: string;
  sourceType: SourceType;
  sourceUrl?: string;
  tags: string[];
  concepts: ConceptLink[];
  createdAt: Date;
  updatedAt: Date;
  reviewCount: number;
  lastReviewedAt?: Date;
  nextReviewAt?: Date;
  retentionScore: number;
}

export type SourceType =
  | 'manual'
  | 'conversation'
  | 'import'
  | 'highlight'
  | 'note';

export interface ConceptLink {
  conceptId: string;
  relevance: number; // 0-1
}

// ============================================================================
// Concept Types (Knowledge Graph)
// ============================================================================

export interface Concept {
  id: string;
  userId: string;
  name: string;
  description?: string;
  aliases: string[];
  parentConcepts: string[];
  childConcepts: string[];
  relatedConcepts: RelatedConcept[];
  entryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RelatedConcept {
  conceptId: string;
  relationshipType: RelationshipType;
  strength: number; // 0-1
}

export type RelationshipType =
  | 'related_to'
  | 'prerequisite_of'
  | 'builds_on'
  | 'contrasts_with'
  | 'example_of'
  | 'part_of';

// ============================================================================
// Conversation Types
// ============================================================================

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  messages: Message[];
  extractedEntries: string[]; // KnowledgeEntry IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  tokenCount?: number;
  model?: string;
  referencedEntries?: string[];
  referencedConcepts?: string[];
}

// ============================================================================
// Review Types (Spaced Repetition)
// ============================================================================

export interface ReviewSession {
  id: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  items: ReviewItem[];
  stats: ReviewStats;
}

export interface ReviewItem {
  entryId: string;
  presented: boolean;
  response?: ReviewResponse;
  responseTime?: number; // milliseconds
}

export type ReviewResponse = 'forgot' | 'hard' | 'good' | 'easy';

export interface ReviewStats {
  totalItems: number;
  completedItems: number;
  correctCount: number;
  averageResponseTime: number;
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
}

export interface SearchFilters {
  tags?: string[];
  concepts?: string[];
  sourceTypes?: SourceType[];
  dateRange?: DateRange;
  minRetentionScore?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface SearchResult {
  entries: KnowledgeEntry[];
  totalCount: number;
  facets?: SearchFacets;
}

export interface SearchFacets {
  tags: FacetCount[];
  concepts: FacetCount[];
  sourceTypes: FacetCount[];
}

export interface FacetCount {
  value: string;
  count: number;
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ============================================================================
// Job Types
// ============================================================================

export interface Job<T = unknown> {
  id: string;
  type: JobType;
  data: T;
  status: JobStatus;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export type JobType =
  | 'extract_concepts'
  | 'generate_embeddings'
  | 'schedule_review'
  | 'send_notification'
  | 'sync_knowledge_graph';

export type JobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export type NotificationType =
  | 'review_reminder'
  | 'daily_digest'
  | 'insight'
  | 'achievement'
  | 'system';

// ============================================================================
// Analytics Types
// ============================================================================

export interface LearningStats {
  userId: string;
  period: StatsPeriod;
  entriesCreated: number;
  reviewsCompleted: number;
  averageRetention: number;
  streakDays: number;
  topConcepts: ConceptStat[];
  learningVelocity: number;
}

export type StatsPeriod = 'day' | 'week' | 'month' | 'year' | 'all_time';

export interface ConceptStat {
  conceptId: string;
  conceptName: string;
  entryCount: number;
  averageRetention: number;
}

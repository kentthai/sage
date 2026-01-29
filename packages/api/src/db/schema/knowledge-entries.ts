import { pgTable, text, timestamp, uuid, integer, real, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const knowledgeEntries = pgTable('knowledge_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  summary: text('summary'),
  sourceType: text('source_type').$type<SourceType>().notNull().default('manual'),
  sourceUrl: text('source_url'),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  reviewCount: integer('review_count').notNull().default(0),
  lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
  nextReviewAt: timestamp('next_review_at', { withTimezone: true }),
  retentionScore: real('retention_score').notNull().default(0),
});

export type SourceType = 'manual' | 'conversation' | 'import' | 'highlight' | 'note';

// Junction table for knowledge entries and concepts
export const entryConceptLinks = pgTable('entry_concept_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id').notNull().references(() => knowledgeEntries.id, { onDelete: 'cascade' }),
  conceptId: uuid('concept_id').notNull(),
  relevance: real('relevance').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

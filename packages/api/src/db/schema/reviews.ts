import { pgTable, text, timestamp, uuid, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const reviewSessions = pgTable('review_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  stats: jsonb('stats').$type<ReviewStats>().notNull().default({
    totalItems: 0,
    completedItems: 0,
    correctCount: 0,
    averageResponseTime: 0,
  }),
});

export const reviewItems = pgTable('review_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => reviewSessions.id, { onDelete: 'cascade' }),
  entryId: uuid('entry_id').notNull(),
  presented: boolean('presented').notNull().default(false),
  response: text('response').$type<ReviewResponse>(),
  responseTime: integer('response_time'), // milliseconds
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type ReviewResponse = 'forgot' | 'hard' | 'good' | 'easy';

export interface ReviewStats {
  totalItems: number;
  completedItems: number;
  correctCount: number;
  averageResponseTime: number;
}

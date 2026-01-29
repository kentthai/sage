import { Container } from 'inversify';

// Dependency injection container
// Bindings will be added as implementations are created

const container = new Container({
  defaultScope: 'Singleton',
});

// Example binding (commented out until implementations exist):
// container.bind<IJobQueue>(TYPES.JobQueue).to(BullMQJobQueue);

export { container };

// Injection tokens
export const TYPES = {
  // Providers
  JobQueue: Symbol.for('JobQueue'),
  LLMProvider: Symbol.for('LLMProvider'),
  CacheProvider: Symbol.for('CacheProvider'),
  SearchProvider: Symbol.for('SearchProvider'),
  GraphProvider: Symbol.for('GraphProvider'),
  AuthProvider: Symbol.for('AuthProvider'),
  NotificationProvider: Symbol.for('NotificationProvider'),

  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  KnowledgeEntryRepository: Symbol.for('KnowledgeEntryRepository'),
  ConceptRepository: Symbol.for('ConceptRepository'),
  ConversationRepository: Symbol.for('ConversationRepository'),
  ReviewSessionRepository: Symbol.for('ReviewSessionRepository'),

  // Services
  KnowledgeService: Symbol.for('KnowledgeService'),
  ConversationService: Symbol.for('ConversationService'),
  ReviewService: Symbol.for('ReviewService'),
  SearchService: Symbol.for('SearchService'),
  AnalyticsService: Symbol.for('AnalyticsService'),
} as const;

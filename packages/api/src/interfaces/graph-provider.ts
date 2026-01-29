import type { Concept, RelatedConcept, RelationshipType } from '@sage/shared';

/**
 * Knowledge graph provider interface.
 * Implementations: Neo4j, Postgres with recursive CTEs, etc.
 */
export interface IGraphProvider {
  /**
   * Create a concept node
   */
  createConcept(concept: Concept): Promise<Concept>;

  /**
   * Get a concept by ID
   */
  getConcept(conceptId: string): Promise<Concept | null>;

  /**
   * Update a concept
   */
  updateConcept(
    conceptId: string,
    updates: Partial<Concept>
  ): Promise<Concept>;

  /**
   * Delete a concept and its relationships
   */
  deleteConcept(conceptId: string): Promise<void>;

  /**
   * Create a relationship between concepts
   */
  createRelationship(
    sourceId: string,
    targetId: string,
    type: RelationshipType,
    strength?: number
  ): Promise<void>;

  /**
   * Remove a relationship between concepts
   */
  removeRelationship(
    sourceId: string,
    targetId: string,
    type?: RelationshipType
  ): Promise<void>;

  /**
   * Get related concepts
   */
  getRelated(
    conceptId: string,
    options?: RelatedOptions
  ): Promise<RelatedConcept[]>;

  /**
   * Find path between two concepts
   */
  findPath(
    sourceId: string,
    targetId: string,
    options?: PathOptions
  ): Promise<ConceptPath | null>;

  /**
   * Get concept hierarchy (ancestors and descendants)
   */
  getHierarchy(
    conceptId: string,
    options?: HierarchyOptions
  ): Promise<ConceptHierarchy>;

  /**
   * Find concepts by name or alias
   */
  findConcepts(
    query: string,
    userId: string,
    limit?: number
  ): Promise<Concept[]>;

  /**
   * Get most connected concepts for a user
   */
  getTopConcepts(
    userId: string,
    limit?: number
  ): Promise<ConceptWithStats[]>;

  /**
   * Merge two concepts into one
   */
  mergeConcepts(
    sourceId: string,
    targetId: string
  ): Promise<Concept>;

  /**
   * Check graph provider health
   */
  healthCheck(): Promise<boolean>;

  /**
   * Close the graph connection
   */
  close(): Promise<void>;
}

export interface RelatedOptions {
  types?: RelationshipType[];
  depth?: number;
  limit?: number;
  minStrength?: number;
}

export interface PathOptions {
  maxDepth?: number;
  relationshipTypes?: RelationshipType[];
}

export interface ConceptPath {
  nodes: Concept[];
  relationships: Array<{
    source: string;
    target: string;
    type: RelationshipType;
  }>;
  length: number;
}

export interface HierarchyOptions {
  ancestorDepth?: number;
  descendantDepth?: number;
}

export interface ConceptHierarchy {
  concept: Concept;
  ancestors: Concept[];
  descendants: Concept[];
}

export interface ConceptWithStats extends Concept {
  connectionCount: number;
  avgRelationshipStrength: number;
}

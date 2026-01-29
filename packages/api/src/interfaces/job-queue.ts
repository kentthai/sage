import type { Job, JobType, JobStatus } from '@sage/shared';

/**
 * Job queue interface for background task processing.
 * Implementations: BullMQ (default), AWS SQS, etc.
 */
export interface IJobQueue {
  /**
   * Add a job to the queue
   */
  enqueue<T>(
    type: JobType,
    data: T,
    options?: JobOptions
  ): Promise<string>;

  /**
   * Get a job by ID
   */
  getJob(jobId: string): Promise<Job | null>;

  /**
   * Get job status
   */
  getStatus(jobId: string): Promise<JobStatus | null>;

  /**
   * Cancel a pending job
   */
  cancel(jobId: string): Promise<boolean>;

  /**
   * Register a job processor
   */
  process<T>(
    type: JobType,
    handler: JobHandler<T>
  ): void;

  /**
   * Pause processing for a job type
   */
  pause(type?: JobType): Promise<void>;

  /**
   * Resume processing for a job type
   */
  resume(type?: JobType): Promise<void>;

  /**
   * Get queue statistics
   */
  getStats(): Promise<QueueStats>;

  /**
   * Close the queue connection
   */
  close(): Promise<void>;
}

export interface JobOptions {
  priority?: number;
  delay?: number; // milliseconds
  attempts?: number;
  backoff?: BackoffStrategy;
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
}

export interface BackoffStrategy {
  type: 'fixed' | 'exponential';
  delay: number;
}

export type JobHandler<T> = (
  job: Job<T>
) => Promise<void>;

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

import type { Message } from '@sage/shared';

/**
 * LLM provider interface for AI interactions.
 * Implementations: OpenAI, Anthropic, local models, etc.
 */
export interface ILLMProvider {
  /**
   * Generate a chat completion
   */
  chat(
    messages: Message[],
    options?: ChatOptions
  ): Promise<ChatResponse>;

  /**
   * Generate a streaming chat completion
   */
  chatStream(
    messages: Message[],
    options?: ChatOptions
  ): AsyncIterable<ChatStreamChunk>;

  /**
   * Generate embeddings for text
   */
  embed(
    text: string | string[],
    options?: EmbedOptions
  ): Promise<EmbeddingResponse>;

  /**
   * Get available models
   */
  listModels(): Promise<ModelInfo[]>;

  /**
   * Check if the provider is available
   */
  healthCheck(): Promise<boolean>;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
  systemPrompt?: string;
  responseFormat?: 'text' | 'json';
}

export interface ChatResponse {
  content: string;
  model: string;
  usage: TokenUsage;
  finishReason: FinishReason;
}

export interface ChatStreamChunk {
  content: string;
  done: boolean;
  usage?: TokenUsage;
  finishReason?: FinishReason;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export type FinishReason = 'stop' | 'length' | 'content_filter' | 'error';

export interface EmbedOptions {
  model?: string;
  dimensions?: number;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage: {
    totalTokens: number;
  };
}

export interface ModelInfo {
  id: string;
  name: string;
  contextWindow: number;
  supportsStreaming: boolean;
  supportsEmbeddings: boolean;
}

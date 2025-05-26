/**
 * Utility functions for token counting and context window management
 */

/**
 * Estimate the number of tokens in a string.
 * This is a rough approximation - about 4 characters per token for English text.
 * 
 * @param text The text to estimate token count for
 * @returns Estimated number of tokens
 */
export const estimateTokenCount = (text: string): number => {
  // A rough estimation: ~4 chars per token for English text
  return Math.ceil(text.length / 4);
};

/**
 * The maximum context window size for the model (in tokens)
 * We're using an 8k token limit for conversation history
 */
export const MAX_CONTEXT_TOKENS = 8000;

/**
 * Calculate how many tokens to reserve for the response
 * Reserve 25% of the context window for the model's response
 */
export const RESPONSE_TOKEN_BUFFER = Math.ceil(MAX_CONTEXT_TOKENS * 0.25);

/**
 * Available tokens for input context
 */
export const AVAILABLE_INPUT_TOKENS = MAX_CONTEXT_TOKENS - RESPONSE_TOKEN_BUFFER; 
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
 * GPT-4 models typically have 8k-128k token context windows
 * We're keeping a conservative limit of 16k
 */
export const MAX_CONTEXT_TOKENS = 16000;

/**
 * Calculate how many tokens to reserve for the response
 * Reserve 25% of the context window for the model's response
 */
export const RESPONSE_TOKEN_BUFFER = Math.ceil(MAX_CONTEXT_TOKENS * 0.25);

/**
 * Available tokens for input context
 */
export const AVAILABLE_INPUT_TOKENS = MAX_CONTEXT_TOKENS - RESPONSE_TOKEN_BUFFER; 
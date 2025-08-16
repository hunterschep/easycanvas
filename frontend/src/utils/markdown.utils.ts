/**
 * Utility functions for processing markdown text
 */

/**
 * Strips markdown formatting from text and returns plain text
 * @param markdown - The markdown text to strip
 * @param maxLength - Optional maximum length for the result
 * @returns Plain text without markdown formatting
 */
export function stripMarkdown(markdown: string, maxLength?: number): string {
  if (!markdown) return '';

  let text = markdown
    // Remove headers (# ## ### etc.)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold and italic (**text** *text* __text__ _text_)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove strikethrough (~~text~~)
    .replace(/~~(.*?)~~/g, '$1')
    // Remove inline code (`code`)
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks (```code```)
    .replace(/```[\s\S]*?```/g, '[code block]')
    // Remove blockquotes (> text)
    .replace(/^>\s+/gm, '')
    // Remove links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images ![alt](url) -> [image]
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '[image]')
    // Remove horizontal rules (--- or ***)
    .replace(/^[-*]{3,}$/gm, '')
    // Remove list markers (- * + and 1. 2. etc.)
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove table formatting
    .replace(/\|/g, ' ')
    // Clean up extra whitespace
    .replace(/\n\s*\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Apply length limit if specified
  if (maxLength && text.length > maxLength) {
    text = text.substring(0, maxLength).trim();
    // Try to break at a word boundary
    const lastSpace = text.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      text = text.substring(0, lastSpace);
    }
    text += '...';
  }

  return text;
}

/**
 * Extracts a clean preview from markdown text
 * Optimized for chat message previews
 */
export function getMarkdownPreview(markdown: string, maxLength: number = 120): string {
  return stripMarkdown(markdown, maxLength);
}

/**
 * Checks if text contains markdown formatting
 */
export function hasMarkdownFormatting(text: string): boolean {
  const markdownPatterns = [
    /^#{1,6}\s+/m,           // Headers
    /(\*\*|__).+?\1/,        // Bold
    /(\*|_).+?\1/,           // Italic
    /~~.+?~~/,               // Strikethrough
    /`.+?`/,                 // Inline code
    /```[\s\S]*?```/,        // Code blocks
    /^\s*[-*+]\s+/m,         // Unordered lists
    /^\s*\d+\.\s+/m,         // Ordered lists
    /\[.+?\]\(.+?\)/,        // Links
    /!\[.*?\]\(.+?\)/,       // Images
    /^>\s+/m,                // Blockquotes
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
}

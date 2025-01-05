import DOMPurify from 'dompurify';

export const parseHtmlContent = (html: string): string => {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  // Sanitize and set HTML
  tempDiv.innerHTML = DOMPurify.sanitize(html);

  // Extract all links
  const links = Array.from(tempDiv.getElementsByTagName('a'))
    .map(a => `[${a.textContent?.trim()}](${a.href})`)
    .filter(link => link.length > 0);

  // Get text content
  let text = tempDiv.textContent || '';
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // Add links at the bottom if they exist
  if (links.length > 0) {
    text += '\n\nImportant Links:\n' + links.join('\n');
  }

  return text;
}; 
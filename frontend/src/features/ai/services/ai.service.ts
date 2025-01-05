import { ApiService } from '@/services/api/api.service';
import { parseHtmlContent } from '@/utils/html.utils';

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async summarizeText(text: string): Promise<string> {
    const cleanText = parseHtmlContent(text);
    const response = await ApiService.post<{ summary: string }>('/api/ai/summarize', { text: cleanText });
    return response.summary;
  }
}

export const aiService = AIService.getInstance();
import { ApiService } from '@/services/api/api.service';

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
    const response = await ApiService.post<{ summary: string }>('/api/ai/summarize', { text });
    return response.summary;
  }
}

export const aiService = AIService.getInstance();
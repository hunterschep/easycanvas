import { useState } from 'react';
import { aiService } from '../services/ai.service';

export const useAISummary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarize = async (text: string): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      const summary = await aiService.summarizeText(text);
      return summary;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { summarize, loading, error };
};

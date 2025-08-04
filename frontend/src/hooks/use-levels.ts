import { useState, useCallback } from 'react';
import { LevelResponse } from '@/types/level';
import { buildApiUrl } from '@/config/api';

interface UseLevelsReturn {
  levels: LevelResponse[];
  loading: boolean;
  error: string | null;
  fetchLevels: (languageName: string) => Promise<void>;
}

export const useLevels = (): UseLevelsReturn => {
  const [levels, setLevels] = useState<LevelResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLevels = useCallback(async (languageName: string) => {
    if (!languageName.trim()) {
      setError('Language name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        buildApiUrl(`/user/level?languageName=${encodeURIComponent(languageName)}`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch levels: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Assuming the API returns CustomResponse with data field
      if (data && data.data) {
        setLevels(data.data);
      } else {
        setLevels([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch levels');
      setLevels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    levels,
    loading,
    error,
    fetchLevels,
  };
};
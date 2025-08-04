import { useState, useEffect } from 'react';
import { Language, LanguageResponse } from '@/types/language';
import { buildApiUrl } from '@/config/api';

interface UseLanguagesReturn {
  languages: Language[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useLanguages = (): UseLanguagesReturn => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLanguages = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl('/user/languages'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch languages: ${response.statusText}`);
      }

      const data: LanguageResponse = await response.json();
      
      if (data && data.data) {
        setLanguages(data.data);
      } else {
        setLanguages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch languages');
      setLanguages([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch languages on mount
  useEffect(() => {
    fetchLanguages();
  }, []);

  return {
    languages,
    loading,
    error,
    refetch: fetchLanguages,
  };
};
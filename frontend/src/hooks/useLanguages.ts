import { useState, useEffect } from 'react';
import { Language } from '@/types';

export function useLanguages() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLanguages = async () => {
    setIsLoading(true);
    try {
      // API call implementation
      setLanguages([]);
    } catch (err) {
      setError('Failed to fetch languages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  return {
    languages,
    isLoading,
    error,
    refetch: fetchLanguages
  };
}
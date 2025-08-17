import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { buildApiUrl } from '@/config/api';

interface TopicResponse {
  id: number;
  name: string;
  type: string; // Changed from union type to string to catch any unexpected values
  description: string;
}

interface TopicsPageResponse {
  content: TopicResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface CreateTopicRequest {
  name: string;
  description: string;
  languageRequest: { name: string };
  levelRequest: { name: string };
}

interface UpdateTopicRequest {
  name: string;
  description: string;
  levelRequest: { name: string };
  originalName?: string; // Add this for tracking the original name
}

interface UseTopicsReturn {
  topics: TopicResponse[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  fetchTopics: (params: {
    levelName: string;
    languageName: string;
    userId?: number; // Make userId optional since we'll get it from localStorage
    page?: number;
    size?: number;
  }) => Promise<void>;
  createTopic: (username: string, data: CreateTopicRequest) => Promise<void>;
  updateTopic: (username: string, data: UpdateTopicRequest) => Promise<void>;
  deleteTopic: (username: string, topicName: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const useTopics = (): UseTopicsReturn => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTopics = useCallback(async (params: {
    levelName: string;
    languageName: string;
    userId?: number; // Make userId optional since we'll get it from localStorage
    page?: number;
    size?: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      // Get userId from localStorage if not provided
      let userId = params.userId;
      if (!userId) {
        const userDataString = localStorage.getItem('user');
        if (!userDataString) {
          // No user data in localStorage, redirect to login
          navigate({ to: '/auth/login' });
          return;
        }
        
        try {
          const userData = JSON.parse(userDataString);
          userId = userData.id ? Number(userData.id) : undefined;
        } catch (parseError) {
          console.error('Error parsing user data from localStorage:', parseError);
          // Invalid user data, redirect to login
          localStorage.removeItem('user');
          navigate({ to: '/auth/login' });
          return;
        }

        if (!userId) {
          // No valid userId found, redirect to login
          navigate({ to: '/auth/login' });
          return;
        }
      }

      const { levelName, languageName, page = 0, size = 10 } = params;
      
      const url = buildApiUrl(`/user/topic?userId=${userId}&languageName=${languageName}&levelName=${levelName}&page=${page}&size=${size}&sortBy=id`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch topics: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.data) {
        setTopics(data.data.content || []);
        setTotalPages(data.data.totalPages || 0);
        setCurrentPage(data.data.number || 0);
      } else {
        setTopics([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch topics');
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const createTopic = useCallback(async (username: string, data: CreateTopicRequest) => {
    setIsCreating(true);
    setError(null);

    try {
      const url = buildApiUrl(`/user/topic/${username}/add-topic`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to create topic: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result && result.data) {
        setTopics(prev => [...prev, result.data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create topic');
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateTopic = useCallback(async (username: string, data: UpdateTopicRequest & { originalName?: string }) => {
    setIsUpdating(true);
    setError(null);

    try {
      const url = buildApiUrl(`/user/topic/${username}/update-topic`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update topic: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result && result.data) {
        // Update the topic in the list using the original name as identifier
        const nameToMatch = data.originalName || data.name;
        setTopics(prev => prev.map(topic => 
          topic.name === nameToMatch ? result.data : topic
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update topic');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const deleteTopic = useCallback(async (username: string, topicName: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      const url = buildApiUrl(`/user/topic/${username}/delete-topic?topicName=${topicName}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete topic: ${response.statusText}`);
      }

      setTopics(prev => prev.filter(topic => topic.name !== topicName));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete topic');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    topics,
    loading,
    error,
    totalPages,
    currentPage,
    fetchTopics,
    createTopic,
    updateTopic,
    deleteTopic,
    isCreating,
    isUpdating,
    isDeleting
  };
};



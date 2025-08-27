import { useState, useCallback } from 'react';
import { buildApiUrl } from '@/config/api';
import { lessonApi, CreateLessonRequest, UpdateLessonRequest } from '@/api/lesson';

interface LessonResponse {
  id: number;
  name: string;
  description?: string;
  type: string;
  lastPractice?: string;
  status: string;
}

interface LessonsPageResponse {
  content: LessonResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface UseLessonsReturn {
  lessons: LessonResponse[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  fetchLessons: (params: {
    userId: number;
    levelName: string;
    languageName: string;
    topicName?: string;
    page?: number;
    size?: number;
  }) => Promise<void>;
  createLesson: (username: string, data: CreateLessonRequest) => Promise<void>;
  updateLesson: (username: string, data: UpdateLessonRequest) => Promise<void>;
  deleteLesson: (username: string, lessonName: string) => Promise<void>;
}

export const useLessons = (): UseLessonsReturn => {
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLessons = useCallback(async (params: {
    userId: number;
    levelName: string;
    languageName: string;
    topicName?: string;
    page?: number;
    size?: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const { userId, levelName, languageName, topicName = '', page = 0, size = 10 } = params;
      
      const queryParams = new URLSearchParams({
        userId: userId.toString(),
        levelName,
        languageName,
        topicName,
        page: page.toString(),
        size: size.toString(),
        sortBy: 'id'
      });

      const url = buildApiUrl(`/user/lesson?${queryParams.toString()}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch lessons: ${response.statusText}`);
      }

      const data = await response.json();
      if (data && data.data) {
        setLessons(data.data.content || []);
        setTotalPages(data.data.totalPages || 0);
        setCurrentPage(data.data.number || 0);
      } else {
        setLessons([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lessons');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLesson = useCallback(async (username: string, data: CreateLessonRequest) => {
    setIsCreating(true);
    setError(null);

    try {
      const result = await lessonApi.createLesson(username, data);
      
      if (result && result.data) {
        setLessons(prev => [...prev, result.data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lesson');
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateLesson = useCallback(async (username: string, data: UpdateLessonRequest) => {
    setIsUpdating(true);
    setError(null);

    try {
      const result = await lessonApi.updateLesson(username, data);
      
      if (result && result.data) {
        setLessons(prev => prev.map(lesson => 
          lesson.name === data.name ? result.data : lesson
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lesson');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const deleteLesson = useCallback(async (username: string, lessonName: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      await lessonApi.deleteLesson(username, lessonName);
      setLessons(prev => prev.filter(lesson => lesson.name !== lessonName));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lesson');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    lessons,
    loading,
    error,
    totalPages,
    currentPage,
    isCreating,
    isUpdating,
    isDeleting,
    fetchLessons,
    createLesson,
    updateLesson,
    deleteLesson
  };
};




import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { userLearningApi } from '@/features/lesson-discovery/api/lessonDiscoveryApi'
import type {
  TopicFilters,
  LessonFilters,
} from '@/features/lesson-discovery/types/lesson-selection'

export const useAllLanguages = () => {
  return useQuery({
    queryKey: ['all-languages'],
    queryFn: () => userLearningApi.getAllLanguages(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useLevelsByLanguage = (languageName: string) => {
  return useQuery({
    queryKey: ['levels-by-language', languageName],
    queryFn: () => userLearningApi.getLevelsByLanguage(languageName),
    enabled: !!languageName,
    staleTime: 5 * 60 * 1000,
  })
}

export const useTopics = (filters: TopicFilters) => {
  return useQuery({
    queryKey: ['user-topics', filters],
    queryFn: () => userLearningApi.getTopics(filters),
    placeholderData: keepPreviousData,
    enabled: !!filters.languageName,
  })
}

export const useLessons = (filters: LessonFilters) => {
  return useQuery({
    queryKey: ['user-lessons', filters],
    queryFn: () => userLearningApi.getLessons(filters),
    placeholderData: keepPreviousData,
    enabled: !!filters.languageId,
  })
}

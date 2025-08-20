import { createFileRoute } from '@tanstack/react-router';
import LessonPracticePage from '@/features/user/lesson-practice';
import { useAuth } from '@/context/auth-context';

interface LessonPracticeSearch {
	levelId?: number;
	levelName?: string;
	languageName?: string;
	topicId?: number;
	topicName?: string;
}

export const Route = createFileRoute('/user/lesson-practice/$lessonId')({
	component: LessonPracticePageComponent,
	validateSearch: (search: Record<string, unknown>): LessonPracticeSearch => {
		return {
			levelId: search.levelId ? Number(search.levelId) : undefined,
			levelName: search.levelName ? String(search.levelName) : undefined,
			languageName: search.languageName ? String(search.languageName) : undefined,
			topicId: search.topicId ? Number(search.topicId) : undefined,
			topicName: search.topicName ? String(search.topicName) : undefined
		}
	}
});

function LessonPracticePageComponent() {
	const { lessonId } = Route.useParams();
	const searchParams = Route.useSearch();
	const { user, isLoading } = useAuth();

	if (isLoading || !user?.username) return null;

	const username = user.username;

	return (
		<LessonPracticePage 
			lessonId={Number(lessonId)}
			username={username}
			searchParams={searchParams}
		/>
	);
}
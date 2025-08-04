import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, ArrowLeft, CheckCircle, XCircle, Eye, EyeOff, RotateCcw, ChevronLeft, ChevronRight, BookOpen, X, Clock, History } from 'lucide-react';
import { useLessonPractice } from './hooks/useLessonPractice';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ParsedHistoryResult } from '@/api/history';
import { HistoryList } from '@/components/history/HistoryList';

interface LessonPracticePageProps {
  lessonId: number;
  username: string;
  searchParams?: {
    levelId?: number;
    levelName?: string;
    languageName?: string;
    topicId?: number;
    topicName?: string;
  };
}

export default function LessonPracticePage({ lessonId, username, searchParams }: LessonPracticePageProps) {
  const navigate = useNavigate();
  const {
    lesson,
    sentences,
    currentSentenceIndex,
    userAnswer,
    setUserAnswer,
    validationResult,
    setValidationResult,
    isLoadingLesson,
    isValidating,
    error,
    fetchLesson,
    submitAnswer,
    nextSentence,
    previousSentence,
    isCompleted,
    showParagraph,
    paragraphPosition,
    toggleParagraph,
    toggleParagraphPosition,
    suggestedVocabulary,
    isLoadingVocabulary,
    showVocabulary,
    fetchSuggestedVocabulary,
    toggleVocabulary,
    lessonHistory,
    isLoadingHistory,
    showHistory,
    fetchLessonHistory,
    toggleHistory
  } = useLessonPractice(lessonId, username);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    await submitAnswer();
  };

  const handleNext = () => {
    nextSentence();
  };

  const handlePrevious = () => {
    previousSentence();
  };

  const canProceed = true; // Always allow proceeding
  const shouldShowRetry = validationResult && validationResult.score < 80;
  const canGoBack = currentSentenceIndex > 0;
  const isLastSentence = currentSentenceIndex >= sentences.length - 1;
  const canGoNext = currentSentenceIndex < sentences.length - 1;

  const currentSentence = sentences[currentSentenceIndex];
  const progress = sentences.length > 0 ? ((currentSentenceIndex + 1) / sentences.length) * 100 : 0;

  // Render paragraph panel
  const ParagraphPanel = () => {
    const paragraphStyle = {
      color: '#1e293b',
      backgroundColor: 'transparent',
      fontSize: '0.875rem',
      lineHeight: '1.5',
      whiteSpace: 'pre-wrap' as const,
      fontWeight: '500'
    };

    return (
      <Card className="h-fit sticky top-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Đoạn văn gốc</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleParagraphPosition}
              title="Chuyển vị trí"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 border p-4 rounded-lg max-h-96 overflow-y-auto">
            <p style={paragraphStyle}>
              {lesson?.paragraph}
            </p>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Câu hiện tại: {currentSentenceIndex + 1}/{sentences.length}
          </div>
        </CardContent>
      </Card>
    );
  };

  const parseHistoryResult = (resultString: string): ParsedHistoryResult | null => {
    try {
      const cleanedResult = resultString.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedResult);
    } catch {
      return null;
    }
  };

  const handleBackToLessons = () => {
    if (searchParams && searchParams.levelId && searchParams.levelName && searchParams.languageName) {
      navigate({ 
        to: '/user/lessons',
        search: {
          levelId: searchParams.levelId,
          levelName: searchParams.levelName,
          languageName: searchParams.languageName,
          ...(searchParams.topicId && { topicId: searchParams.topicId }),
          ...(searchParams.topicName && { topicName: searchParams.topicName })
        }
      });
    } else {
      // Fallback to lessons page without search params
      navigate({ to: '/user/lessons' });
    }
  };

  if (isLoadingLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        <span className="text-lg">Đang tải bài học...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleBackToLessons}>
              Quay lại danh sách bài học
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chúc mừng!</h3>
            <p className="text-muted-foreground mb-4">
              Bạn đã hoàn thành bài học "{lesson?.name}"
            </p>
            <Button onClick={handleBackToLessons}>
              Quay lại danh sách bài học
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToLessons}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{lesson?.name}</h1>
            <p className="text-muted-foreground">{lesson?.description}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleParagraph}
          >
            {showParagraph ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showParagraph ? 'Ẩn đoạn văn' : 'Hiện đoạn văn'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSuggestedVocabulary}
            disabled={isLoadingVocabulary}
          >
            {isLoadingVocabulary ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BookOpen className="h-4 w-4 mr-2" />
            )}
            Từ vựng gợi ý
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLessonHistory}
            disabled={isLoadingHistory}
          >
            {isLoadingHistory ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <History className="h-4 w-4 mr-2" />
            )}
            Lịch sử
          </Button>
        </div>

        <div className={`grid gap-6 ${showParagraph ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {/* Left Panel - Paragraph (if position is left) */}
          {showParagraph && paragraphPosition === 'left' && (
            <div className="lg:col-span-1">
              <ParagraphPanel />
            </div>
          )}

          {/* Main Content */}
          <div className={showParagraph ? 'lg:col-span-2' : 'col-span-1 max-w-4xl mx-auto'}>
            {/* Progress */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tiến độ</span>
                  <span className="text-sm text-muted-foreground">
                    Câu {currentSentenceIndex + 1} / {sentences.length}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            {/* Current Sentence */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Dịch câu sau sang tiếng Anh:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-lg font-medium text-blue-900">
                    {currentSentence}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Input
                    placeholder="Nhập bản dịch tiếng Anh của bạn..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={isValidating || !!validationResult}
                    className="text-lg"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isValidating && !validationResult) {
                        handleSubmit();
                      }
                    }}
                  />
                  
                  <div className="flex gap-2">
                    {/* Previous Button */}
                    {canGoBack && (
                      <Button
                        onClick={handlePrevious}
                        disabled={isValidating}
                        variant="outline"
                        size="sm"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Câu trước
                      </Button>
                    )}

                    {/* Main Action Buttons */}
                    <div className="flex gap-2 flex-1">
                      {!validationResult ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={!userAnswer.trim() || isValidating}
                          className="flex-1"
                        >
                          {isValidating ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Đang kiểm tra...
                            </>
                          ) : (
                            'Kiểm tra'
                          )}
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => {
                            setUserAnswer('');
                            setValidationResult(null);
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Thử lại
                        </Button>
                      )}
                    </div>

                    {/* Next Button */}
                    {canGoNext && (
                      <Button
                        onClick={handleNext}
                        disabled={isValidating}
                        variant="outline"
                        size="sm"
                      >
                        Câu tiếp theo
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}

                    {/* Complete Button - only show on last sentence */}
                    {isLastSentence && (
                      <Button
                        onClick={handleNext}
                        disabled={isValidating}
                        size="sm"
                      >
                        Hoàn thành
                      </Button>
                    )}
                  </div>

                  {/* Navigation Helper Text */}
                  <div className="text-xs text-muted-foreground text-center">
                    Bạn có thể di chuyển tự do giữa các câu để ôn tập
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation Result */}
            {validationResult && (
              <Card>
                <CardContent className="pt-6">
                  <div className={`p-4 rounded-lg border ${
                    validationResult.status === 'perfect' ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' :
                    validationResult.status === 'good' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800' :
                    'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {validationResult.status === 'perfect' ? (
                        <CheckCircle className="h-5 w-5 text-green-700 dark:text-green-400" />
                      ) : validationResult.status === 'good' ? (
                        <CheckCircle className="h-5 w-5 text-yellow-700 dark:text-yellow-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-700 dark:text-red-400" />
                      )}
                      <span className={`font-semibold ${
                        validationResult.status === 'perfect' ? 'text-green-800 dark:text-green-200' :
                        validationResult.status === 'good' ? 'text-yellow-800 dark:text-yellow-200' :
                        'text-red-800 dark:text-red-200'
                      }`}>
                        Điểm: {validationResult.score}/100
                      </span>
                    </div>
                    
                    {validationResult.message && (
                      <p className={`mb-2 ${
                        validationResult.status === 'perfect' ? 'text-green-800 dark:text-green-200' :
                        validationResult.status === 'good' ? 'text-yellow-800 dark:text-yellow-200' :
                        'text-red-800 dark:text-red-200'
                      }`}>{validationResult.message}</p>
                    )}
                    
                    {validationResult.comment && (
                      <p className={`mb-2 ${
                        validationResult.status === 'perfect' ? 'text-green-700 dark:text-green-300' :
                        validationResult.status === 'good' ? 'text-yellow-700 dark:text-yellow-300' :
                        'text-red-700 dark:text-red-300'
                      }`}>{validationResult.comment}</p>
                    )}
                    
                    {validationResult.improvement_suggestions && (
                      <div className="mb-2">
                        <p className={`font-medium ${
                          validationResult.status === 'perfect' ? 'text-green-800 dark:text-green-200' :
                          validationResult.status === 'good' ? 'text-yellow-800 dark:text-yellow-200' :
                          'text-red-800 dark:text-red-200'
                        }`}>Gợi ý cải thiện:</p>
                        <p className={`text-sm ${
                          validationResult.status === 'perfect' ? 'text-green-700 dark:text-green-300' :
                          validationResult.status === 'good' ? 'text-yellow-700 dark:text-yellow-300' :
                          'text-red-700 dark:text-red-300'
                        }`}>{validationResult.improvement_suggestions}</p>
                      </div>
                    )}
                    
                    {validationResult.correct_answer && (
                      <div>
                        <p className={`font-medium ${
                          validationResult.status === 'perfect' ? 'text-green-800 dark:text-green-200' :
                          validationResult.status === 'good' ? 'text-yellow-800 dark:text-yellow-200' :
                          'text-red-800 dark:text-red-200'
                        }`}>Đáp án tham khảo:</p>
                        <p className={`text-sm italic ${
                          validationResult.status === 'perfect' ? 'text-green-700 dark:text-green-300' :
                          validationResult.status === 'good' ? 'text-yellow-700 dark:text-yellow-300' :
                          'text-red-700 dark:text-red-300'
                        }`}>{validationResult.correct_answer}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Paragraph (if position is right) */}
          {showParagraph && paragraphPosition === 'right' && (
            <div className="lg:col-span-1">
              <ParagraphPanel />
            </div>
          )}
        </div>

        {/* Vocabulary Display - Show card when vocabulary panel is open */}
        {showVocabulary && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Từ vựng gợi ý</CardTitle>
              <Button variant="ghost" size="sm" onClick={toggleVocabulary}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {suggestedVocabulary.length > 0 ? (
                <div className="grid gap-3">
                  {suggestedVocabulary.map((vocab) => (
                    <div key={vocab.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{vocab.term}</div>
                          <div className="text-sm text-muted-foreground">{vocab.vietnamese}</div>
                          {vocab.pronunciation && (
                            <div className="text-xs text-blue-600">/{vocab.pronunciation}/</div>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {vocab.type}
                        </Badge>
                      </div>
                      {vocab.example && (
                        <div className="mt-2 text-sm italic text-gray-600">
                          {vocab.example}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Không có từ vựng gợi ý cho bài học này
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={fetchSuggestedVocabulary}
                    disabled={isLoadingVocabulary}
                  >
                    {isLoadingVocabulary ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <BookOpen className="h-4 w-4 mr-2" />
                    )}
                    Thử lại
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showHistory} onOpenChange={toggleHistory}>
        <DialogContent className="w-3/4 max-w-none max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Lịch sử bài học: {lesson?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <HistoryList history={lessonHistory} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}




































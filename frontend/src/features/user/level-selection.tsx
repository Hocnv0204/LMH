import { useState, useEffect } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { LevelResponse } from '@/types/level'
import { BookOpen, ChevronRight, Languages, Loader2 } from 'lucide-react'
import { useLanguages } from '@/hooks/use-languages'
import { useLevels } from '@/hooks/use-levels'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LevelSelectionProps {
  onLevelSelect?: (level: LevelResponse, languageName: string) => void
}

export default function LevelSelection({ onLevelSelect }: LevelSelectionProps) {
  const navigate = useNavigate()
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<LevelResponse | null>(null)
  const {
    languages,
    loading: languagesLoading,
    error: languagesError,
  } = useLanguages()
  const {
    levels,
    loading: levelsLoading,
    error: levelsError,
    fetchLevels,
  } = useLevels()

  // Auto-fetch levels when language is selected
  useEffect(() => {
    if (selectedLanguage) {
      fetchLevels(selectedLanguage)
      setSelectedLevel(null) // Reset selected level when language changes
    }
  }, [selectedLanguage, fetchLevels])

  const handleLanguageSelect = (languageName: string) => {
    setSelectedLanguage(languageName)
  }

  const handleLevelSelect = (level: LevelResponse) => {
    setSelectedLevel(level)
    onLevelSelect?.(level, selectedLanguage)
  }

  const handleStartLearning = () => {
    if (selectedLevel && selectedLanguage) {
      navigate({
        to: '/user/topics',
        search: {
          levelId: selectedLevel.id,
          levelName: selectedLevel.name,
          languageName: selectedLanguage,
        },
      })
    }
  }

  const getLevelBadgeVariant = (levelName: string) => {
    const lowerName = levelName.toLowerCase()
    if (lowerName.includes('a1') || lowerName.includes('beginner'))
      return 'default'
    if (lowerName.includes('a2') || lowerName.includes('elementary'))
      return 'secondary'
    if (lowerName.includes('b1') || lowerName.includes('intermediate'))
      return 'outline'
    if (lowerName.includes('b2') || lowerName.includes('upper'))
      return 'destructive'
    if (lowerName.includes('c1') || lowerName.includes('advanced'))
      return 'default'
    if (lowerName.includes('c2') || lowerName.includes('proficient'))
      return 'secondary'
    return 'default'
  }

  const getLevelDescription = (levelName: string) => {
    const lowerName = levelName.toLowerCase()
    if (lowerName.includes('a1') || lowerName.includes('beginner'))
      return 'Bắt đầu với những từ vựng và cấu trúc câu cơ bản'
    if (lowerName.includes('a2') || lowerName.includes('elementary'))
      return 'Phát triển kỹ năng giao tiếp trong các tình huống hàng ngày'
    if (lowerName.includes('b1') || lowerName.includes('intermediate'))
      return 'Xử lý các chủ đề quen thuộc trong công việc và học tập'
    if (lowerName.includes('b2') || lowerName.includes('upper'))
      return 'Hiểu và thảo luận các chủ đề phức tạp'
    if (lowerName.includes('c1') || lowerName.includes('advanced'))
      return 'Sử dụng ngôn ngữ linh hoạt và hiệu quả'
    if (lowerName.includes('c2') || lowerName.includes('proficient'))
      return 'Thành thạo như người bản xứ'
    return 'Chọn level phù hợp với trình độ của bạn'
  }

  return (
    <div className='container mx-auto max-w-4xl p-6'>
      {/* Page Title */}
      <div className='mb-8 text-center'>
        <div className='mb-4 flex items-center justify-center'>
          <BookOpen className='text-primary mr-3 h-8 w-8' />
          <h1 className='text-3xl font-bold'>Chọn Cấp Độ Học Tập</h1>
        </div>
        <p className='text-muted-foreground text-lg'>
          Tìm và chọn cấp độ phù hợp với trình độ ngôn ngữ của bạn
        </p>
      </div>

      {/* Language Selection */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Languages className='mr-2 h-5 w-5' />
            Chọn Ngôn Ngữ
          </CardTitle>
          <CardDescription>
            Chọn ngôn ngữ bạn muốn học từ danh sách có sẵn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <Label htmlFor='language-select'>Ngôn ngữ</Label>
            <Select
              value={selectedLanguage}
              onValueChange={handleLanguageSelect}
              disabled={languagesLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    languagesLoading
                      ? 'Đang tải danh sách ngôn ngữ...'
                      : 'Chọn ngôn ngữ'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.name} value={language.name}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {languagesLoading && (
              <div className='text-muted-foreground flex items-center text-sm'>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang tải danh sách ngôn ngữ...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Messages */}
      {languagesError && (
        <Alert className='mb-6' variant='destructive'>
          <AlertDescription>
            Lỗi khi tải danh sách ngôn ngữ: {languagesError}
          </AlertDescription>
        </Alert>
      )}

      {levelsError && (
        <Alert className='mb-6' variant='destructive'>
          <AlertDescription>Lỗi khi tải cấp độ: {levelsError}</AlertDescription>
        </Alert>
      )}

      {/* Loading State for Levels */}
      {levelsLoading && selectedLanguage && (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='mr-3 h-8 w-8 animate-spin' />
          <span className='text-lg'>
            Đang tải các cấp độ cho {selectedLanguage}...
          </span>
        </div>
      )}

      {/* No Results */}
      {selectedLanguage &&
        !levelsLoading &&
        levels.length === 0 &&
        !levelsError && (
          <div className='py-12 text-center'>
            <BookOpen className='text-muted-foreground mx-auto mb-4 h-16 w-16' />
            <h3 className='mb-2 text-xl font-semibold'>
              Không tìm thấy cấp độ
            </h3>
            <p className='text-muted-foreground'>
              Không có cấp độ nào cho ngôn ngữ "{selectedLanguage}". Hãy thử
              chọn ngôn ngữ khác.
            </p>
          </div>
        )}

      {/* No Language Selected */}
      {!selectedLanguage && !languagesLoading && languages.length > 0 && (
        <div className='py-12 text-center'>
          <Languages className='text-muted-foreground mx-auto mb-4 h-16 w-16' />
          <h3 className='mb-2 text-xl font-semibold'>
            Chọn ngôn ngữ để bắt đầu
          </h3>
          <p className='text-muted-foreground'>
            Vui lòng chọn một ngôn ngữ từ danh sách trên để xem các cấp độ có
            sẵn.
          </p>
        </div>
      )}

      {/* Levels Grid */}
      {levels.length > 0 && (
        <div>
          <h2 className='mb-6 text-2xl font-semibold'>
            Các cấp độ cho {selectedLanguage}
          </h2>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {levels.map((level) => (
              <Card
                key={level.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedLevel?.id === level.id
                    ? 'ring-primary shadow-lg ring-2'
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleLevelSelect(level)}
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-lg'>{level.name}</CardTitle>
                    <Badge variant={getLevelBadgeVariant(level.name)}>
                      {level.name.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-sm leading-relaxed'>
                    {getLevelDescription(level.name)}
                  </CardDescription>

                  {selectedLevel?.id === level.id && (
                    <div className='mt-4 border-t pt-3'>
                      <div className='text-primary flex items-center text-sm font-medium'>
                        <ChevronRight className='mr-1 h-4 w-4' />
                        Đã chọn cấp độ này
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Level Summary */}
          {selectedLevel && (
            <Card className='bg-primary/5 border-primary/20 mt-8'>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-lg font-semibold'>
                      Bạn đã chọn: {selectedLevel.name}
                    </h3>
                    <p className='text-muted-foreground'>
                      Ngôn ngữ: {selectedLanguage}
                    </p>
                  </div>
                  <Button size='lg' onClick={handleStartLearning}>
                    Bắt Đầu Học
                    <ChevronRight className='ml-2 h-4 w-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

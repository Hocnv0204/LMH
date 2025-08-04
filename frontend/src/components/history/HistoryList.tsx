import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { HistoryResponse, ParsedHistoryResult } from '@/api/history';

interface HistoryListProps {
  history: HistoryResponse[];
  className?: string;
}

interface ExpandedItems {
  [key: number]: boolean;
}

export function HistoryList({ history, className = '' }: HistoryListProps) {
  const [expandedItems, setExpandedItems] = useState<ExpandedItems>({});

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const parseHistoryResult = (resultString: string): ParsedHistoryResult | null => {
    try {
      const cleanedResult = resultString.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedResult);
    } catch {
      return null;
    }
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'perfect': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'needs_improvement': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (history.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground">Chưa có lịch sử câu hỏi</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {history.map((item) => {
        const isExpanded = expandedItems[item.id];
        const parsedResult = parseHistoryResult(item.result);

        return (
          <Card key={item.id} className="bg-white border overflow-visible w-full max-w-none">
            <CardHeader 
              className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpanded(item.id)}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex-1 min-w-0 max-w-none">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    )}
                    <CardTitle className="text-sm font-medium text-black break-words overflow-wrap-anywhere">
                      {isExpanded ? item.question : truncateText(item.question)}
                    </CardTitle>
                  </div>
                </div>
                {parsedResult && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ml-2 flex-shrink-0 ${getStatusColor(parsedResult.status)}`}
                  >
                    {parsedResult.score}/10
                  </Badge>
                )}
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0 overflow-visible w-full max-w-none">
                <div className="space-y-6 w-full">
                  {/* Full Question */}
                  <div className="overflow-visible w-full">
                    <p className="text-sm font-medium text-gray-700 mb-2">Câu hỏi:</p>
                    <div className="bg-blue-50 p-8 rounded-lg min-h-[200px] overflow-visible w-full">
                      <div className="w-full max-w-none">
                        <p className="text-black leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere w-full" style={{ wordBreak: 'break-all' }}>{item.question}</p>
                      </div>
                    </div>
                  </div>

                  {/* User Answer */}
                  <div className="overflow-visible w-full">
                    <p className="text-sm font-medium text-gray-700 mb-2">Câu trả lời của bạn:</p>
                    <div className="bg-gray-50 p-8 rounded-lg min-h-[200px] overflow-visible w-full">
                      <div className="w-full max-w-none">
                        <p className="text-black leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere w-full" style={{ wordBreak: 'break-all' }}>{item.answer}</p>
                      </div>
                    </div>
                  </div>

                  {/* Validation Result */}
                  {parsedResult && (
                    <div className="space-y-4 overflow-visible w-full">
                      <div className="flex items-center gap-2 flex-wrap w-full">
                        <p className="text-sm font-medium text-gray-700">Kết quả:</p>
                        <Badge className={getStatusColor(parsedResult.status)}>
                          {parsedResult.status === 'perfect' && 'Hoàn hảo'}
                          {parsedResult.status === 'good' && 'Tốt'}
                          {parsedResult.status === 'needs_improvement' && 'Cần cải thiện'}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Điểm: {parsedResult.score}/10
                        </span>
                      </div>

                      {parsedResult.message && (
                        <div className="overflow-visible w-full">
                          <div className="bg-gray-50 p-8 rounded-lg min-h-[150px] overflow-visible w-full">
                            <div className="w-full max-w-none">
                              <p className="text-sm text-black leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere w-full" style={{ wordBreak: 'break-all' }}>{parsedResult.message}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {parsedResult.improvement_suggestions && (
                        <div className="overflow-visible w-full">
                          <p className="text-sm font-medium text-gray-700 mb-2">Gợi ý cải thiện:</p>
                          <div className="bg-yellow-50 p-8 rounded-lg min-h-[200px] overflow-visible w-full">
                            <div className="w-full max-w-none">
                              <p className="text-sm text-black leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere w-full" style={{ wordBreak: 'break-all' }}>{parsedResult.improvement_suggestions}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {parsedResult.correct_answer && (
                        <div className="overflow-visible w-full">
                          <p className="text-sm font-medium text-gray-700 mb-2">Đáp án tham khảo:</p>
                          <div className="bg-green-50 p-8 rounded-lg min-h-[200px] overflow-visible w-full">
                            <div className="w-full max-w-none">
                              <p className="text-sm italic text-black leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere w-full" style={{ wordBreak: 'break-all' }}>{parsedResult.correct_answer}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  {item.createdAt && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 pt-2 border-t w-full">
                      <Clock className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}





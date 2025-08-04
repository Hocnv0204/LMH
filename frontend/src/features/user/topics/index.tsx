import { useState, useEffect } from 'react';
import { BookOpen, ChevronLeft, Loader2, Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTopics } from '@/hooks/use-topics';
import { useNavigate } from '@tanstack/react-router';

interface TopicsPageProps {
  levelId: number;
  levelName: string;
  languageName: string;
}

interface TopicFormData {
  name: string;
  description: string;
  languageName: string;
  levelName: string;
}

export default function TopicsPage({ levelId, levelName, languageName }: TopicsPageProps) {
  const navigate = useNavigate();
  const { 
    topics, 
    loading, 
    error, 
    fetchTopics, 
    createTopic, 
    updateTopic, 
    deleteTopic,
    isCreating,
    isUpdating,
    isDeleting
  } = useTopics();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [deletingTopic, setDeletingTopic] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TopicFormData>({
    name: '',
    description: '',
    languageName: languageName,
    levelName: levelName
  });

  const currentUsername = 'minh'; // Replace with actual username from auth context

  useEffect(() => {
    fetchTopics({
      levelName,
      languageName,
      userId: 1 // Replace with actual user ID from auth context
    });
  }, [levelName, languageName, fetchTopics]);

  const handleBackToLevels = () => {
    navigate({ to: '/user/level' });
  };

  const handleTopicSelect = (topicId: number, topicName: string) => {
    navigate({
      to: '/user/lessons',
      search: {
        levelId,
        levelName,
        languageName,
        topicId,
        topicName
      }
    });
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTopic(currentUsername, {
        name: formData.name,
        description: formData.description,
        languageRequest: { name: formData.languageName },
        levelRequest: { name: formData.levelName }
      });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', languageName, levelName });
    } catch (error) {
      console.error('Failed to create topic:', error);
    }
  };

  const handleEditTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;
    
    // Check if name already exists (excluding current topic)
    const nameExists = topics.some(topic => 
      topic.name.toLowerCase() === formData.name.toLowerCase() && 
      topic.id !== editingTopic.id
    );
    
    if (nameExists) {
      setError(`Tên chủ đề "${formData.name}" đã tồn tại. Vui lòng chọn tên khác.`);
      return;
    }
    
    try {
      await updateTopic(currentUsername, {
        name: formData.name,
        description: formData.description,
        levelRequest: { name: formData.levelName },
        originalName: editingTopic.name // Pass the original name for backend identification
      });
      setIsEditDialogOpen(false);
      setEditingTopic(null);
      setError(null);
      
      // Refresh the topics list to ensure we have the latest data
      await fetchTopics({
        levelName,
        languageName,
        userId: 1
      });
    } catch (error) {
      console.error('Failed to update topic:', error);
      setError('Không thể cập nhật chủ đề. Vui lòng thử lại.');
    }
  };

  const handleDeleteTopic = async () => {
    if (!deletingTopic) return;
    
    try {
      await deleteTopic(currentUsername, deletingTopic.name);
      setIsDeleteDialogOpen(false);
      setDeletingTopic(null);
    } catch (error) {
      console.error('Failed to delete topic:', error);
    }
  };

  const openEditDialog = (topic: any) => {
    setEditingTopic(topic);
    setFormData({
      name: topic.name,
      description: topic.description,
      languageName: languageName,
      levelName: levelName
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (topic: any) => {
    setDeletingTopic(topic);
    setIsDeleteDialogOpen(true);
  };

  const canModifyTopic = (topic: any) => {
    // More robust type checking
    const topicType = topic.type?.toString().trim().toUpperCase();
    const canModify = topicType === 'USER_CREATION';
    
    return canModify;
  };

  // Add this useEffect to debug the topics data
  useEffect(() => {
    console.log('All topics received:', topics);
    topics.forEach(topic => {
      console.log(`Topic: ${topic.name}, Type: "${topic.type}", Type of type: ${typeof topic.type}`);
    });
  }, [topics]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={handleBackToLevels}
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Chọn Chủ Đề</h1>
            <p className="text-muted-foreground">
              {languageName} - {levelName}
            </p>
          </div>
        </div>
        
        {/* Create Topic Button */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo Chủ Đề
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo Chủ Đề Mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <Label htmlFor="name">Tên Chủ Đề</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Mô Tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Tạo
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Message */}
      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertDescription>
            Lỗi: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Đang tải chủ đề...</span>
        </div>
      )}

      {/* No Results */}
      {!loading && topics.length === 0 && !error && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Chưa có chủ đề</h3>
          <p className="text-muted-foreground">
            Hiện tại chưa có chủ đề nào cho cấp độ "{levelName}" trong ngôn ngữ "{languageName}".
          </p>
        </div>
      )}

      {/* Topics Grid */}
      {topics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg relative"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle 
                    className="text-lg"
                    onClick={() => handleTopicSelect(topic.id, topic.name)}
                  >
                    {topic.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={topic.type === 'DEFAULT' ? 'secondary' : 'default'}>
                      {topic.type === 'DEFAULT' ? 'Mặc định' : 'Tự tạo'}
                    </Badge>
                    {/* Debug: Always show the dropdown for testing */}
                    {console.log('Rendering dropdown for topic:', topic.name, 'canModify:', canModifyTopic(topic))}
                    {canModifyTopic(topic) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(topic)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(topic)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {/* Temporary: Show dropdown for all topics to test rendering */}
                    {!canModifyTopic(topic) && (
                      <div className="text-xs text-muted-foreground">
                        (Default topic)
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent onClick={() => handleTopicSelect(topic.id, topic.name)}>
                {topic.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {topic.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Topic Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Chủ Đề</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditTopic} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Tên Chủ Đề</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Nhập tên chủ đề"
              />
              {formData.name.trim() === '' && (
                <p className="text-sm text-red-600 mt-1">Tên chủ đề không được để trống</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-description">Mô Tả</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                placeholder="Nhập mô tả chủ đề"
              />
              {formData.description.trim() === '' && (
                <p className="text-sm text-red-600 mt-1">Mô tả không được để trống</p>
              )}
            </div>
            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={isUpdating || !formData.name.trim() || !formData.description.trim()}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Cập nhật
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setError(null); // Clear errors when closing
                }}
              >
                Hủy
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác Nhận Xóa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Bạn có chắc chắn muốn xóa chủ đề "{deletingTopic?.name}"? Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-4">
            <Button 
              variant="destructive" 
              onClick={handleDeleteTopic}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Xóa
            </Button>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}














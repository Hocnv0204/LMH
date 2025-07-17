'use client'

import type React from 'react'
import { useState } from 'react'
import { X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type Topic = {
  id: string
  name: string
  description: string
  imageUrl?: string
  lessonCount: number
  displayOrder: 'high' | 'medium' | 'low'
  status: 'active' | 'inactive'
  createdAt: Date
}

interface TopicFormProps {
  initialData?: Topic
  onSubmit: (data: Omit<Topic, 'id' | 'createdAt'>) => void
}

export function TopicForm({ initialData, onSubmit }: TopicFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    lessonCount: initialData?.lessonCount || 0,
    displayOrder: initialData?.displayOrder || ('high' as const),
    status: initialData?.status || ('active' as const),
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }))
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, you would upload the file here and get the URL
    const finalImageUrl = previewUrl || formData.imageUrl

    onSubmit({
      ...formData,
      imageUrl: finalImageUrl,
    })
  }

  const isEditMode = !!initialData
  const currentImageUrl = previewUrl || formData.imageUrl

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Tên Chủ đề *</Label>
        <Input
          id='name'
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          required
          placeholder='Nhập tên chủ đề'
        />
      </div>

      <div className='max-w-full space-y-2'>
        <Label htmlFor='description'>Mô tả Chủ đề</Label>
        <Textarea
          id='description'
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder='Nhập mô tả chủ đề'
          rows={3}
          className='max-h-48 overflow-hidden break-words'
        />
      </div>

      <div className='space-y-2'>
        <Label>Ảnh chủ đề</Label>
        <div className='space-y-3'>
          {currentImageUrl && (
            <div className='flex items-center gap-3'>
              <Avatar className='h-16 w-16'>
                <AvatarImage
                  src={currentImageUrl || '/placeholder.svg'}
                  alt='Topic avatar'
                />
                <AvatarFallback>IMG</AvatarFallback>
              </Avatar>
              <Button
                type='button'
                variant='destructive'
                size='sm'
                onClick={handleRemoveImage}
              >
                <X className='mr-1 h-4 w-4' />
                Xóa ảnh
              </Button>
            </div>
          )}
          <Input
            type='file'
            accept='image/png,image/jpeg,image/jpg'
            onChange={handleFileChange}
          />
          <p className='text-muted-foreground text-sm'>
            Gợi ý: Ảnh vuông, PNG/JPG, dưới 2MB.
          </p>
        </div>
      </div>

      {/* <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='displayOrder'>Thứ tự hiển thị</Label>
          <Input
            id='displayOrder'
            type='number'
            min='1'
            value={formData.displayOrder}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                displayOrder: Number.parseInt(e.target.value) || 1,
              }))
            }
          />
        </div>
      </div> */}

      <div className='space-y-2'>
        <Label>Thứ tự hiển thị</Label>
        <Select
          value={formData.displayOrder}
          onValueChange={(value: 'high' | 'medium' | 'low') =>
            setFormData((prev) => ({ ...prev, displayOrder: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='high'>Cao</SelectItem>
            <SelectItem value='medium'>Trung bình</SelectItem>
            <SelectItem value='low'>Thấp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label>Trạng thái</Label>
        <Select
          value={formData.status}
          onValueChange={(value: 'active' | 'inactive') =>
            setFormData((prev) => ({ ...prev, status: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='active'>Đang hoạt động</SelectItem>
            <SelectItem value='inactive'>Không hoạt động</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type='submit' className='w-full'>
        {isEditMode ? 'Lưu thay đổi' : 'Tạo Chủ đề'}
      </Button>
    </form>
  )
}

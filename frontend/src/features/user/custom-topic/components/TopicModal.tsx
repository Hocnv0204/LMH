'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useAllLanguages } from '@/features/lesson-discovery/hooks/useLessonDiscovery'
import type {
  TopicRequest,
  TopicResponse,
} from '@/features/user/custom-topic/types/topic'

interface TopicModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TopicRequest, file?: File) => void
  topic?: TopicResponse | null
  isLoading?: boolean
}

export function TopicModal({
  isOpen,
  onClose,
  onSubmit,
  topic,
  isLoading,
}: TopicModalProps) {
  const [formData, setFormData] = useState<TopicRequest>({
    name: '',
    description: '',
    languageRequest: { name: '' },
  })
  const [selectedFile, setSelectedFile] = useState<File | undefined>()

  const { data: languagesResponse } = useAllLanguages()

  useEffect(() => {
    if (topic) {
      setFormData({
        name: topic.name,
        description: topic.description,
        languageRequest: { name: topic.languageName },
      })
    } else {
      setFormData({
        name: '',
        description: '',
        languageRequest: { name: '' },
      })
    }
    setSelectedFile(undefined)
  }, [topic, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData, selectedFile)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSelectedFile(file)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {topic ? 'Update Topic' : 'Create New Topic'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Topic Name</Label>
            <Input
              id='name'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder='Enter topic name'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder='Enter topic description'
              rows={3}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='language'>Language</Label>
            <Select
              value={formData.languageRequest.name}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  languageRequest: { name: value },
                })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a language' />
              </SelectTrigger>
              <SelectContent>
                {languagesResponse?.data.map((language) => (
                  <SelectItem key={language.id} value={language.name}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='image'>Image (Optional)</Label>
            <Input
              id='image'
              type='file'
              accept='image/*'
              onChange={handleFileChange}
            />
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={
                isLoading || isLoading || !formData.languageRequest.name
              }
            >
              {isLoading ? 'Saving...' : topic ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

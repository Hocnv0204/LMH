"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X, Upload, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Topic, TypeTopic } from "@/types"
import { useAuth } from "@/hooks/useAuth"
import { useLanguages } from "@/hooks/useLanguages"
import { useCreateTopic, useUpdateTopic } from "@/hooks/useTopics"

const topicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  languageId: z.number().min(1, "Language is required"),
  type: z.nativeEnum(TypeTopic).optional(),
  note: z.string().optional(),
})

type TopicFormData = z.infer<typeof topicSchema>

interface TopicDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  topic?: Topic
  mode: "create" | "edit"
}

export function TopicDialog({ open, onOpenChange, topic, mode }: TopicDialogProps) {
  const { user } = useAuth()
  const { data: languages } = useLanguages()
  const createTopic = useCreateTopic()
  const updateTopic = useUpdateTopic()

  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([])
  const [selectAllLanguages, setSelectAllLanguages] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const isAdmin = user?.role === "ADMIN"
  const isCreating = mode === "create"

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      name: "",
      description: "",
      languageId: 0,
      type: TypeTopic.DEFAULT,
      note: "",
    },
  })

  const watchedLanguageId = watch("languageId")

  // Reset form when dialog opens/closes or topic changes
  useEffect(() => {
    if (open) {
      if (topic && mode === "edit") {
        reset({
          name: topic.name,
          description: topic.description,
          languageId: topic.language.id,
          type: topic.type,
          note: topic.note || "",
        })
        setImagePreview(topic.imageUrl || null)
      } else {
        reset({
          name: "",
          description: "",
          languageId: 0,
          type: TypeTopic.DEFAULT,
          note: "",
        })
        setImagePreview(null)
      }
      setImageFile(null)
      setSelectedLanguages([])
      setSelectAllLanguages(false)
    }
  }, [open, topic, mode, reset])

  // Handle language selection for multi-language creation
  useEffect(() => {
    if (isCreating && languages) {
      if (selectAllLanguages) {
        setSelectedLanguages(languages.map((lang) => lang.id))
      } else if (watchedLanguageId && watchedLanguageId > 0) {
        setSelectedLanguages([watchedLanguageId])
      }
    }
  }, [selectAllLanguages, watchedLanguageId, languages, isCreating])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLanguageToggle = (languageId: number) => {
    setSelectedLanguages((prev) =>
      prev.includes(languageId) ? prev.filter((id) => id !== languageId) : [...prev, languageId],
    )
  }

  const handleSelectAllToggle = () => {
    setSelectAllLanguages(!selectAllLanguages)
    if (!selectAllLanguages && languages) {
      setSelectedLanguages(languages.map((lang) => lang.id))
    } else {
      setSelectedLanguages([])
    }
  }

  const onSubmit = async (data: TopicFormData) => {
    try {
      if (isCreating) {
        // For creation, create topics for all selected languages
        const languagesToCreate =
          selectAllLanguages || selectedLanguages.length > 1 ? selectedLanguages : [data.languageId]

        for (const langId of languagesToCreate) {
          await createTopic.mutateAsync({
            ...data,
            languageId: langId,
            image: imageFile || undefined,
          })
        }
      } else if (topic) {
        // For editing, update the single topic
        await updateTopic.mutateAsync({
          id: topic.id,
          data: {
            name: data.name,
            description: data.description,
            languageId: data.languageId,
            image: imageFile || undefined,
          },
        })
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save topic:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreating ? "Create New Topic" : "Edit Topic"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Topic Name</Label>
              <Input id="name" {...register("name")} placeholder="Enter topic name" />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} placeholder="Enter topic description" rows={4} />
              {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
            </div>

            {/* Language Selection */}
            <div>
              <Label>Language</Label>
              {isCreating ? (
                <div className="space-y-3">
                  <Select
                    value={watchedLanguageId?.toString() || ""}
                    onValueChange={(value) => setValue("languageId", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages?.map((language) => (
                        <SelectItem key={language.id} value={language.id.toString()}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Multi-language options for creation */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="select-all" checked={selectAllLanguages} onCheckedChange={handleSelectAllToggle} />
                      <Label htmlFor="select-all" className="font-medium">
                        Create for all languages
                      </Label>
                    </div>

                    {!selectAllLanguages && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Or select specific languages:</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {languages?.map((language) => (
                            <div key={language.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`lang-${language.id}`}
                                checked={selectedLanguages.includes(language.id)}
                                onCheckedChange={() => handleLanguageToggle(language.id)}
                              />
                              <Label htmlFor={`lang-${language.id}`} className="text-sm">
                                {language.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {selectAllLanguages
                        ? `Will create topic for all ${languages?.length || 0} languages`
                        : `Will create topic for ${selectedLanguages.length} selected language(s)`}
                    </p>
                  </div>
                </div>
              ) : (
                <Select
                  value={watchedLanguageId?.toString() || ""}
                  onValueChange={(value) => setValue("languageId", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages?.map((language) => (
                      <SelectItem key={language.id} value={language.id.toString()}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.languageId && <p className="text-sm text-red-600 mt-1">{errors.languageId.message}</p>}
            </div>

            {/* Admin-only fields */}
            {isAdmin && (
              <>
                <div>
                  <Label htmlFor="type">Topic Type</Label>
                  <Select
                    value={watch("type") || TypeTopic.DEFAULT}
                    onValueChange={(value) => setValue("type", value as TypeTopic)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TypeTopic.DEFAULT}>Default</SelectItem>
                      <SelectItem value={TypeTopic.USER_CREATION}>User Creation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="note">Admin Note</Label>
                  <Textarea id="note" {...register("note")} placeholder="Internal notes (admin only)" rows={3} />
                </div>
              </>
            )}

            {/* Image Upload */}
            <div>
              <Label>Topic Image</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <Input type="file" accept="image/*" onChange={handleImageChange} className="flex-1" />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>

                {imagePreview && (
                  <div className="relative w-32 h-32">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || createTopic.isPending || updateTopic.isPending}>
              {isSubmitting || createTopic.isPending || updateTopic.isPending ? (
                "Saving..."
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {isCreating ? "Create Topic" : "Update Topic"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

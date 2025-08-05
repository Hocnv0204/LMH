"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
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
import { type Topic, TypeTopic, Language } from "@/types"
import { useAuth } from "@/hooks/useAuth"
import { useLanguages } from "@/hooks/useLanguages"
import { useCreateTopic, useUpdateTopic } from "@/hooks/useTopics"

const topicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  languageId: z.number().min(1, "Language is required"),
  type: z.enum(["DEFAULT", "USER_CREATION"]),
  note: z.string(),
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
  const { languages } = useLanguages()
  const createTopic = useCreateTopic()
  const updateTopic = useUpdateTopic()

  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([])
  const [selectAllLanguages, setSelectAllLanguages] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
      type: "DEFAULT" as TypeTopic,
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
          type: "DEFAULT" as TypeTopic,
          note: "",
        })
        setImagePreview(null)
      }
      setImageFile(null)
      setSelectedLanguages([])
      setSelectAllLanguages(false)
    }
  }, [open, topic, mode, reset]) // Added missing dependencies

  // Handle language selection for multi-language creation
  useEffect(() => {
    if (isCreating && languages) {
      if (selectAllLanguages) {
        setSelectedLanguages(languages.map((lang) => lang.id))
      } else if (watchedLanguageId && watchedLanguageId > 0) {
        setSelectedLanguages([watchedLanguageId])
      }
    }
  }, [selectAllLanguages, watchedLanguageId, languages, isCreating]) // All dependencies present

  // Add this useEffect to sync form state with language selection
  useEffect(() => {
    if (isCreating && !selectAllLanguages && selectedLanguages.length === 1) {
      setValue("languageId", selectedLanguages[0])
    }
  }, [selectedLanguages, selectAllLanguages, isCreating, setValue])

  const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSubmitError('Please select a valid image file')
        return
      }
      
      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('Image file size must be less than 5MB')
        return
      }

      setSubmitError(null)
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.onerror = () => {
        setSubmitError('Failed to read image file')
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleLanguageToggle = useCallback((languageId: number) => {
    setSelectedLanguages((prev) =>
      prev.includes(languageId) ? prev.filter((id) => id !== languageId) : [...prev, languageId],
    )
  }, [])

  const handleSelectAllToggle = useCallback(() => {
    setSelectAllLanguages((prev) => {
      const newValue = !prev
      if (newValue && languages) {
        setSelectedLanguages(languages.map((lang) => lang.id))
      } else {
        setSelectedLanguages([])
      }
      return newValue
    })
  }, [languages])

  const onSubmit = async (data: TopicFormData) => {
    setSubmitError(null) // Clear previous errors
    
    try {
      if (isCreating) {
        const languagesToCreate =
          selectAllLanguages || selectedLanguages.length > 1 ? selectedLanguages : [data.languageId]

        if (languagesToCreate.length === 0) {
          setSubmitError("Please select at least one language")
          return
        }

        const createPromises = languagesToCreate.map(langId =>
          createTopic.mutateAsync({
            name: data.name,
            description: data.description,
            languageId: langId,
            type: data.type,
            note: data.note,
            image: imageFile || undefined,
          })
        )
        
        await Promise.all(createPromises)
      } else if (topic) {
        await updateTopic.mutateAsync({
          id: topic.id,
          data: {
            name: data.name,
            description: data.description,
            languageId: data.languageId,
            type: data.type,
            note: data.note,
            image: imageFile || undefined,
          },
        })
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save topic:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to save topic")
    }
  }

  useEffect(() => {
    // Cleanup object URLs when component unmounts or image changes
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

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
              <Input 
                id="name" 
                {...register("name")} 
                placeholder="Enter topic name"
                aria-describedby={errors.name ? "name-error" : undefined}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-red-600 mt-1" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                {...register("description")} 
                placeholder="Enter topic description" 
                rows={4}
                aria-describedby={errors.description ? "description-error" : undefined}
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p id="description-error" className="text-sm text-red-600 mt-1" role="alert">
                  {errors.description.message}
                </p>
              )}
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
                      <Checkbox checked={selectAllLanguages} onChange={handleSelectAllToggle} />
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
                                checked={selectedLanguages.includes(language.id)}
                                onChange={() => handleLanguageToggle(language.id)}
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
                    value={watch("type") || "DEFAULT"}
                    onValueChange={(value) => setValue("type", value as TypeTopic)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEFAULT">Default</SelectItem>
                      <SelectItem value="USER_CREATION">User Creation</SelectItem>
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
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md border"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
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

          {/* Add this before the form actions */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600" role="alert">
                {submitError}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || createTopic.isPending || updateTopic.isPending}
              aria-describedby={submitError ? "submit-error" : undefined}
            >
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

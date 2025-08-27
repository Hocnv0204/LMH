'use client'

import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Coins,
  Star,
  Clock,
  Settings,
  Key,
  BookOpen,
  FileText,
  Bookmark,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrentUserProfile } from '@/features/user-profile/hooks/useProfile'

interface UserProfileCardProps {
  onUpdateProfile: () => void
  onUpdateApiConfig: () => void
  onViewVocabCollection: () => void
  onViewCustomLessons: () => void
  onViewCustomTopics: () => void
}

export function UserProfileCard({
  onUpdateProfile,
  onUpdateApiConfig,
  onViewVocabCollection,
  onViewCustomLessons,
  onViewCustomTopics,
}: UserProfileCardProps) {
  const { data, isLoading, error } = useCurrentUserProfile()

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-12'>
          <div className='text-center'>Loading profile...</div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data?.data) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-12'>
          <div className='text-center text-red-500'>Failed to load profile</div>
        </CardContent>
      </Card>
    )
  }

  const profile = data.data

  const getInitials = (name: string, username: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return username.slice(0, 2).toUpperCase()
  }

  return (
    <div className='space-y-6'>
      {/* Main Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-6 md:flex-row'>
            {/* Avatar and Basic Info */}
            <div className='flex flex-col items-center space-y-4'>
              <Avatar className='h-24 w-24'>
                <AvatarFallback className='text-2xl font-semibold'>
                  {getInitials(profile.name, profile.username)}
                </AvatarFallback>
              </Avatar>
              <div className='text-center'>
                <h2 className='text-2xl font-bold'>
                  {profile.name || profile.username}
                </h2>
                <p className='text-muted-foreground'>@{profile.username}</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className='flex-1 space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Mail className='text-muted-foreground h-4 w-4' />
                    <span className='text-sm'>{profile.email}</span>
                  </div>
                  {profile.phoneNumber && (
                    <div className='flex items-center gap-2'>
                      <Phone className='text-muted-foreground h-4 w-4' />
                      <span className='text-sm'>{profile.phoneNumber}</span>
                    </div>
                  )}
                  {profile.dateOfBirth && (
                    <div className='flex items-center gap-2'>
                      <Calendar className='text-muted-foreground h-4 w-4' />
                      <span className='text-sm'>
                        {new Date(profile.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {profile.school && (
                    <div className='flex items-center gap-2'>
                      <GraduationCap className='text-muted-foreground h-4 w-4' />
                      <span className='text-sm'>{profile.school}</span>
                    </div>
                  )}
                </div>

                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Star className='h-4 w-4 text-yellow-500' />
                    <span className='text-sm'>Points: </span>
                    <Badge variant='secondary'>{profile.point}</Badge>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Coins className='h-4 w-4 text-green-500' />
                    <span className='text-sm'>Credits: </span>
                    <Badge variant='secondary'>{profile.credit}</Badge>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Clock className='text-muted-foreground h-4 w-4' />
                    <span className='text-sm'>
                      Joined: {new Date(profile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {profile.lastLogin && (
                    <div className='flex items-center gap-2'>
                      <Clock className='text-muted-foreground h-4 w-4' />
                      <span className='text-sm'>
                        Last login:{' '}
                        {new Date(profile.lastLogin).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <Card
          className='cursor-pointer transition-shadow hover:shadow-md'
          onClick={onUpdateProfile}
        >
          <CardContent className='flex flex-col items-center justify-center p-6 text-center'>
            <Settings className='mb-2 h-8 w-8 text-blue-500' />
            <h3 className='font-semibold'>Update Information</h3>
            <p className='text-muted-foreground mt-1 text-xs'>
              Edit your profile details
            </p>
          </CardContent>
        </Card>

        <Card
          className='cursor-pointer transition-shadow hover:shadow-md'
          onClick={onUpdateApiConfig}
        >
          <CardContent className='flex flex-col items-center justify-center p-6 text-center'>
            <Key className='mb-2 h-8 w-8 text-purple-500' />
            <h3 className='font-semibold'>Update API</h3>
            <p className='text-muted-foreground mt-1 text-xs'>
              Configure API settings
            </p>
          </CardContent>
        </Card>

        <Card
          className='cursor-pointer transition-shadow hover:shadow-md'
          onClick={onViewVocabCollection}
        >
          <CardContent className='flex flex-col items-center justify-center p-6 text-center'>
            <Bookmark className='mb-2 h-8 w-8 text-green-500' />
            <h3 className='font-semibold'>Vocab Collection</h3>
            <p className='text-muted-foreground mt-1 text-xs'>
              View saved vocabulary
            </p>
          </CardContent>
        </Card>

        <Card
          className='cursor-pointer transition-shadow hover:shadow-md'
          onClick={onViewCustomLessons}
        >
          <CardContent className='flex flex-col items-center justify-center p-6 text-center'>
            <BookOpen className='mb-2 h-8 w-8 text-orange-500' />
            <h3 className='font-semibold'>Custom Lessons</h3>
            <p className='text-muted-foreground mt-1 text-xs'>
              Your created lessons
            </p>
          </CardContent>
        </Card>

        <Card
          className='cursor-pointer transition-shadow hover:shadow-md'
          onClick={onViewCustomTopics}
        >
          <CardContent className='flex flex-col items-center justify-center p-6 text-center'>
            <FileText className='mb-2 h-8 w-8 text-red-500' />
            <h3 className='font-semibold'>Custom Topics</h3>
            <p className='text-muted-foreground mt-1 text-xs'>
              Your created topics
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  School,
  Calendar,
  ArrowLeft,
  Home,
} from 'lucide-react'
import { useAuthHook } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phoneNumber: '',
    name: '',
    school: '',
    dateOfBirth: '',
  })
  const { register } = useAuthHook()
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!')
      return
    }

    if (!formData.name) {
      alert('Vui lòng nhập họ và tên!')
      return
    }

    setIsLoading(true)

    try {
      const result = await register({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        name: formData.name,
        school: formData.school,
        dateOfBirth: formData.dateOfBirth,
      })

      if (result.success) {
        // Navigate to email verification page
        navigate({
          to: '/auth/email-verification',
          search: { email: formData.email, token: undefined },
        })
      } else {
        alert(result.error || 'Đăng ký thất bại!')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert(error instanceof Error ? error.message : 'Đăng ký thất bại!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <div className='flex items-center justify-between'>
            <Link
              to='/'
              className='flex items-center space-x-2 transition-opacity hover:opacity-80'
            >
              <Home className='text-primary h-5 w-5' />
              <span className='text-muted-foreground text-sm'>Trang chủ</span>
            </Link>
            <Link
              to='/auth/login'
              className='rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800'
            >
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </div>
          <CardTitle className='text-2xl font-bold'>
            Đăng ký tài khoản
          </CardTitle>
          <CardDescription>
            Tạo tài khoản mới để bắt đầu học tập
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Username */}
            <div className='space-y-2'>
              <Label htmlFor='username'>Tên đăng nhập</Label>
              <div className='relative'>
                <User className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  id='username'
                  name='username'
                  type='text'
                  placeholder='Nhập tên đăng nhập'
                  value={formData.username}
                  onChange={handleInputChange}
                  className='pl-10'
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <div className='relative'>
                <Mail className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='Nhập email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='pl-10'
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className='space-y-2'>
              <Label htmlFor='password'>Mật khẩu</Label>
              <div className='relative'>
                <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Nhập mật khẩu'
                  value={formData.password}
                  onChange={handleInputChange}
                  className='pr-10 pl-10'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute top-1/2 right-3 -translate-y-1/2 transform'
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-400' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-400' />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Xác nhận mật khẩu</Label>
              <div className='relative'>
                <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='Nhập lại mật khẩu'
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className='pr-10 pl-10'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute top-1/2 right-3 -translate-y-1/2 transform'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-400' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-400' />
                  )}
                </button>
              </div>
            </div>

            {/* Name */}
            <div className='space-y-2'>
              <Label htmlFor='name'>Họ và tên</Label>
              <Input
                id='name'
                name='name'
                type='text'
                placeholder='Nhập họ và tên'
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Phone Number */}
            <div className='space-y-2'>
              <Label htmlFor='phoneNumber'>Số điện thoại</Label>
              <div className='relative'>
                <Phone className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  id='phoneNumber'
                  name='phoneNumber'
                  type='tel'
                  placeholder='Nhập số điện thoại'
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className='pl-10'
                  required
                />
              </div>
            </div>

            {/* School */}
            <div className='space-y-2'>
              <Label htmlFor='school'>Trường học</Label>
              <div className='relative'>
                <School className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  id='school'
                  name='school'
                  type='text'
                  placeholder='Nhập tên trường'
                  value={formData.school}
                  onChange={handleInputChange}
                  className='pl-10'
                  required
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className='space-y-2'>
              <Label htmlFor='dateOfBirth'>Ngày sinh</Label>
              <div className='relative'>
                <Calendar className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  id='dateOfBirth'
                  name='dateOfBirth'
                  type='date'
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className='pl-10'
                  required
                />
              </div>
            </div>

            <Button
              type='submit'
              className='w-full'
              size='lg'
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                  Đang đăng ký...
                </>
              ) : (
                'Đăng ký'
              )}
            </Button>
          </form>

          <div className='mt-6 text-center text-sm'>
            <span className='text-gray-600 dark:text-gray-400'>
              Đã có tài khoản?{' '}
            </span>
            <Link
              to='/auth/login'
              className='text-primary font-medium hover:underline'
            >
              Đăng nhập ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BookOpen,
  Users,
  Settings,
  GraduationCap,
  LogIn,
  UserPlus,
  Target,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { IndexTopBar } from '@/components/layout/index-top-bar'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const quickAccessItems = [
    {
      title: 'Đăng nhập',
      description: 'Truy cập tài khoản của bạn',
      href: '/auth/login',
      icon: LogIn,
      color: 'blue',
    },
    {
      title: 'Đăng ký',
      description: 'Tạo tài khoản mới',
      href: '/auth/register',
      icon: UserPlus,
      color: 'green',
    },
    {
      title: 'Chọn cấp độ',
      description: 'Bắt đầu học tập',
      href: '/user/lesson-discovery',
      icon: Target,
      color: 'purple',
    },
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      green: 'bg-green-100 text-green-600 hover:bg-green-200',
      purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
      orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <div className='bg-background min-h-screen'>
      <IndexTopBar />
      {/* Hero Section */}

      {/* Hero Section */}
      <section className='px-4 py-12'>
        <div className='mx-auto max-w-6xl'>
          <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2'>
            {/* Left Content */}
            <div className='space-y-6'>
              <div className='space-y-4'>
                <h2 className='text-4xl font-bold tracking-tight lg:text-5xl'>
                  Master English Through{' '}
                  <span className='text-primary'>Interactive Translation</span>
                </h2>
                <p className='text-muted-foreground text-xl leading-relaxed'>
                  Learn English and improve your writing with AI-powered
                  sentence-by-sentence translation. Perfect for learners at all
                  levels.
                </p>
              </div>

              <div className='flex flex-col gap-4 sm:flex-row'>
                <Link to='/auth/register'>
                  <Button size='lg' className='w-full sm:w-auto'>
                    Get Started
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Button>
                </Link>
                <Link to='/user/lesson-discovery'>
                  <Button
                    variant='outline'
                    size='lg'
                    className='w-full sm:w-auto'
                  >
                    <BookOpen className='mr-2 h-4 w-4' />
                    Browse Lessons
                  </Button>
                </Link>
              </div>

              <div className='text-muted-foreground flex items-center space-x-8 text-sm'>
                <div className='flex items-center space-x-2'>
                  <Users className='h-4 w-4' />
                  <span>10,000+ Students</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <BookOpen className='h-4 w-4' />
                  <span>500+ Lessons</span>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <Card className='border-primary/20'>
                <CardHeader className='pb-3'>
                  <div className='bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-lg'>
                    <GraduationCap className='text-primary h-6 w-6' />
                  </div>
                  <CardTitle className='text-lg'>AI-Powered Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Advanced AI technology provides personalized learning
                    experiences and real-time feedback.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className='border-primary/20'>
                <CardHeader className='pb-3'>
                  <div className='bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-lg'>
                    <Target className='text-primary h-6 w-6' />
                  </div>
                  <CardTitle className='text-lg'>
                    Interactive Practice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Practice with sentence-by-sentence translation and
                    interactive exercises.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className='border-primary/20'>
                <CardHeader className='pb-3'>
                  <div className='bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-lg'>
                    <Users className='text-primary h-6 w-6' />
                  </div>
                  <CardTitle className='text-lg'>Community Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Join thousands of learners and track your progress with
                    detailed analytics.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className='border-primary/20'>
                <CardHeader className='pb-3'>
                  <div className='bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-lg'>
                    <Settings className='text-primary h-6 w-6' />
                  </div>
                  <CardTitle className='text-lg'>Adaptive System</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our system adapts to your learning pace and provides
                    customized content.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Quick Access Section */}
      <section className='px-4 py-12'>
        <div className='mx-auto max-w-6xl'>
          <div className='mb-12 text-center'>
            <h3 className='mb-4 text-3xl font-bold'>Quick Access</h3>
            <p className='text-muted-foreground text-lg'>
              Get started with our platform in just a few clicks
            </p>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
            {quickAccessItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link key={item.title} to={item.href} className='group'>
                  <Card className='h-full transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                    <CardHeader className='pb-3'>
                      <div
                        className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg transition-colors group-hover:scale-110 ${getColorClasses(item.color)}`}
                      >
                        <IconComponent className='h-6 w-6' />
                      </div>
                      <CardTitle className='text-lg'>{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{item.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t px-4 py-8'>
        <div className='mx-auto max-w-6xl text-center'>
          <p className='text-muted-foreground'>
            © 2024 LMH English. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

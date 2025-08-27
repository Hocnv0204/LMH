import { Link } from '@tanstack/react-router'
import { Home, LogOut, BookOpen, Target, LogIn, Settings } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

export function UserTopBar() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className='bg-background border-b px-6 py-4'>
      <div className='flex w-full items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Link
            to='/'
            className='flex items-center space-x-2 transition-opacity hover:opacity-80'
          >
            <Home className='text-primary h-6 w-6' />
            <h1 className='text-xl font-bold'>Datpmt English</h1>
          </Link>
          <Badge variant='secondary' className='text-xs'>
            Learning Platform
          </Badge>
        </div>

        <div className='flex items-center space-x-4'>
          <nav className='hidden items-center space-x-4 md:flex lg:space-x-6'>
            <Link
              to='/user/lessons'
              search={{
                levelId: 1,
                levelName: 'Beginner',
                languageName: 'English',
              }}
              className='text-muted-foreground hover:text-primary text-sm font-medium transition-colors'
            >
              WRITING
            </Link>
            <Link
              to='/user/topics'
              search={{
                levelId: 1,
                levelName: 'Beginner',
                languageName: 'English',
              }}
              className='text-muted-foreground hover:text-primary text-sm font-medium transition-colors'
            >
              VOCABULARY
            </Link>
            <Link
              to='/user/level'
              className='text-muted-foreground hover:text-primary text-sm font-medium transition-colors'
            >
              RANK
            </Link>
          </nav>
          <Separator orientation='vertical' className='h-6' />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='flex items-center gap-2'
                >
                  <span>Xin chào, {user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm leading-none font-medium'>
                      {user?.name}
                    </p>
                    <p className='text-muted-foreground text-xs leading-none'>
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to='/user/level'>
                    <BookOpen className='mr-2 h-4 w-4' />
                    Bài học của tôi
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to='/user/topics'
                    search={{
                      levelId: 1,
                      levelName: 'Beginner',
                      languageName: 'English',
                    }}
                  >
                    <Target className='mr-2 h-4 w-4' />
                    Chủ đề của tôi
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className='mr-2 h-4 w-4' />
                  Cài đặt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className='mr-2 h-4 w-4' />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to='/auth/login'>
              <Button variant='default' size='sm'>
                <LogIn className='mr-2 h-4 w-4' />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

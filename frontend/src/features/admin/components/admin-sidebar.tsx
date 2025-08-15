import { Calendar, Home, Inbox, Search, Settings } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

// Menu items.
const items = [
  {
    title: 'Dashboard',
    url: '/admin/',
    icon: Home,
  },
  {
    title: 'Manage Topics',
    url: '/admin/topic/',

    icon: Inbox,
  },
  {
    title: 'Manage Languages',
    url: '/admin/language/',
    icon: Calendar,
  },
  {
    title: 'Manage Levels',
    url: '/admin/level/',
    icon: Search,
  },
  {
    title: 'Manage Users',
    url: '/admin/user/',
    icon: Settings,
  },
  {
    title: 'Manage Lessons',
    url: '/admin/lesson/',
    icon: Settings,
  },
  {
    title: 'History Statistics',
    url: '/admin/history/',
    icon: Settings,
  },
]

export function AdminSidebar() {
  return (
    <Sidebar collapsible='icon'>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href='/'>
                <Home />
                <span>Return Home Page</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

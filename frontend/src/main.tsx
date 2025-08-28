import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from './context/auth-context'
import { ThemeProvider } from './context/theme-context'
import './index.css'
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree })
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <RouterProvider router={router} />
            <Toaster
              position='top-right'
              duration={5000}
              toastOptions={{
                classNames: {
                  toast: '!w-[400px] !p-[20px]',
                  success: '!bg-green-600 !border-green-700 !text-white',
                  error: '!bg-red-600 !border-red-700 !text-white',
                  info: '!bg-blue-500 !border-blue-600 !text-white',
                  warning: '!bg-yellow-500 !border-yellow-600 !text-black',
                },
              }}
            />
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}

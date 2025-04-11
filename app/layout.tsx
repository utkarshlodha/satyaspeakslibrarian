import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Satya Speaks',
  description: 'Ask questions. Get Satya Ji’s wisdom.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}>
          {children}
          <Toaster richColors position="top-center" /> {/* this line is important */}
        </body>
      </html>
    </ClerkProvider>
  )
}

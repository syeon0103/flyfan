import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'flyfan - K-pop 덕질 커뮤니티',
  description: 'K-pop 팬들을 위한 안전하고 즐거운 덕질 커뮤니티 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-zinc-50 text-zinc-900">
        <AuthProvider>
          {/* PC 1920 기준: 중앙 정렬된 앱 컨테이너 */}
          <div className="min-h-screen relative mx-auto bg-white" style={{ maxWidth: '680px' }}>
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import Dashboard from '@/components/Dashboard'

/** 工作台是用户私有数据页，不进索引，也不进 sitemap */
export const metadata: Metadata = {
  title: 'Dashboard · TypingChinese',
  description: 'Your word lists, daily goal, streak and practice progress.',
  robots: { index: false, follow: false },
}

export default function DashboardPage() {
  return <Dashboard />
}

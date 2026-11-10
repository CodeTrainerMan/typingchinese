import type { Metadata } from 'next'
import CyberLanding from '@/components/CyberLanding'

/** canonical 只在首页声明，避免 layout 级设置污染所有子页面 */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

/**
 * 引导页（首次访问入口）：只做产品介绍、功能说明与社区/作者链接。
 * 练习工作台已迁到 /dashboard，这里不再渲染任何仪表盘卡片。
 */
export default function HomePage() {
  return <CyberLanding />
}

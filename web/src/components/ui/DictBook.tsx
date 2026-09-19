import Link from 'next/link'
import ProgressBar from './ProgressBar'
import { useI18n } from '@/i18n'

/**
 * 词库「书」（对标 TypeWords 的 Book.vue）：
 * 固定 9.6rem × 1.4 的书本比例，hover 变浅橙，底部内嵌进度条。
 */
export default function DictBook({
  name,
  count,
  learned,
  current,
  onClick,
}: {
  name: string
  count: number
  learned: number
  current?: boolean
  onClick: () => void
}) {
  const { t } = useI18n()
  const pct = count ? Math.min(100, (learned / count) * 100) : 0
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onClick()
      }}
      className="group relative flex h-[13.44rem] w-[9.6rem] shrink-0 cursor-pointer flex-col justify-between overflow-hidden rounded-lg border border-book-line bg-book p-3 pl-4 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-hover hover:shadow-[var(--shadow-lg)]"
    >
      {/* 书脊 */}
      <span className="pointer-events-none absolute left-0 top-0 h-full w-1.5 rounded-l-lg bg-gradient-to-b from-brand to-brand/40" />

      {current && (
        <span className="absolute right-2 top-2 rounded-sm bg-brand px-2 py-1 text-xs font-medium text-white">
          {t('common.current')}
        </span>
      )}

      <div className="line-clamp-4 pt-1 text-sm font-semibold leading-snug text-ink">{name}</div>

      <div className="text-xs text-dim">
        {learned > 0 && <span className="text-ink2">{learned}/</span>}
        {t('common.words', { n: count })}
      </div>

      <div className="mt-auto w-full">
        <ProgressBar size="sm" value={pct} />
      </div>
    </div>
  )
}

/** 书架末尾的「添加」格：同样尺寸，中间一个加号 */
export function DictBookAdd() {
  const { t } = useI18n()
  return (
    <Link
      href="/dicts"
      className="flex h-[13.44rem] w-[9.6rem] shrink-0 items-center justify-center rounded-lg border border-dashed border-line bg-surface2 text-2xl text-dim transition-colors duration-300 hover:border-brand hover:bg-active hover:text-brand"
      title={t('dicts.addLearning')}
    >
      +
    </Link>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { useSettingStore } from '@/lib/store/setting'
import { useBaseStore } from '@/lib/store/base'
import { useHydrated } from '@/lib/useHydrated'
import CommunityLinks from '@/components/CommunityLinks'
import Page from '@/components/ui/Page'
import PageHeader from '@/components/ui/PageHeader'
import Panel from '@/components/ui/Panel'
import { listZhVoices } from '@/lib/tts'
import { formatBytes, storageBytes, storageWarnLevel, useStorageStore } from '@/lib/storage'
import { LOCALES, useI18n, type MessageKey } from '@/i18n'
import VoicePicker from '@/components/VoicePicker'
import type { InputMode, NextKey, PracticeMode, ReplayKey, ShortcutAction, ThemeMode, TypingMode } from '@/lib/types'

export default function SettingPage() {
  const hydrated = useHydrated()
  const setting = useSettingStore()
  const base = useBaseStore()
  const { t, locale, setLocale } = useI18n()
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null)
  /** 导入方式：默认覆盖（与旧行为一致），勾上才是合并 */
  const [mergeImport, setMergeImport] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  // 配额写满 / 其它标签页改动过：都要让用户看见，不能静默
  const writeError = useStorageStore(s => s.writeError)
  const syncedAt = useStorageStore(s => s.syncedAt)
  // 存储用量只能在挂载后读：服务端没有 localStorage，直接在渲染里算会导致 hydration 不一致
  const [storage, setStorage] = useState<{ usage: string; level: 'ok' | 'warn' | 'full' }>({
    usage: '',
    level: 'ok',
  })
  useEffect(() => {
    setStorage({ usage: formatBytes(storageBytes()), level: storageWarnLevel() })
  }, [writeError, syncedAt])

  // 同一个键绑到多个动作时后一个不会触发，先提示出来
  const usedKeys = new Set<string>()
  const conflict = SHORTCUT_ROWS.some(([action]) => {
    const key = setting.shortcuts?.[action]
    if (!key) return false
    if (usedKeys.has(key)) return true
    usedKeys.add(key)
    return false
  })

  useEffect(() => {
    listZhVoices().then(setVoices)
  }, [])

  if (!hydrated)
    return (
      <Page width="sm">
        <p className="py-16 text-dim">{t('common.loading')}</p>
      </Page>
    )

  return (
    <Page width="sm">
      <PageHeader title={t('setting.title')} />

      <Section title={t('setting.sectionLanguage')}>
        <Row label={t('setting.language')} desc={t('setting.languageDesc')}>
          {/* 语言有 14 种，用下拉而不是分段按钮，否则横向挤不下 */}
          <select
            value={locale}
            onChange={e => setLocale(e.target.value as typeof locale)}
            className="h-9 min-w-[10rem] rounded-lg border border-line bg-surface px-3 text-sm"
          >
            {LOCALES.map(l => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </Row>
      </Section>

      <Section title={t('setting.sectionPractice')}>
        {/* 模式多了一个「智能」（三步编排），下拉比分段按钮更省地方 */}
        <Row label={t('setting.practiceMode')} desc={t('setting.practiceModeDesc')}>
          <select
            value={setting.practiceMode}
            onChange={e => setting.patch({ practiceMode: e.target.value as PracticeMode })}
            className="h-9 min-w-[10rem] rounded-lg border border-line bg-surface px-3 text-sm"
          >
            <option value="smart">{t('setting.modeSmart')}</option>
            <option value="spell">{t('setting.modeSpell')}</option>
            <option value="dictation">{t('setting.modeDictation')}</option>
            <option value="test">{t('setting.modeTest')}</option>
            <option value="write">{t('setting.modeWrite')}</option>
          </select>
        </Row>
        {/* 听写的题目就是发音：没有中文音色时该步骤会退回跟写，先把原因说清楚 */}
        {voices.length === 0 && (setting.practiceMode === 'dictation' || setting.practiceMode === 'smart') && (
          <p className="text-xs text-warn mt-2">{t('setting.noVoice')}</p>
        )}
        <Row label={t('setting.typingMode')} desc={t('setting.typingModeDesc')}>
          <Segmented
            value={setting.typingMode}
            options={[
              { value: 'full', label: t('setting.typingFull') },
              { value: 'initials', label: t('setting.typingInitials') },
              { value: 'tone', label: t('setting.typingTone') },
            ]}
            onChange={v => setting.patch({ typingMode: v as TypingMode })}
          />
        </Row>
        {setting.typingMode === 'tone' && <p className="text-xs text-dim mt-2">{t('setting.toneExample')}</p>}
        <Row label={t('setting.inputMode')} desc={t('setting.inputModeDesc')}>
          <Segmented
            value={setting.inputMode}
            options={[
              { value: 'pinyin', label: t('setting.inputPinyin') },
              { value: 'hanzi', label: t('setting.inputHanzi') },
            ]}
            onChange={v => setting.patch({ inputMode: v as InputMode })}
          />
        </Row>
        <Row label={t('setting.showPinyin')}>
          <Toggle checked={setting.showPinyin} onChange={v => setting.patch({ showPinyin: v })} />
        </Row>
        <Row label={t('setting.showTrans')}>
          <Toggle checked={setting.showTrans} onChange={v => setting.patch({ showTrans: v })} />
        </Row>
        <Row label={t('setting.repeatCount')}>
          <NumberInput value={setting.repeatCount} min={1} max={5} onChange={v => setting.patch({ repeatCount: v })} />
        </Row>
        <Row label={t('setting.autoNext')}>
          <Toggle checked={setting.autoNext} onChange={v => setting.patch({ autoNext: v })} />
        </Row>
        <Row label={t('setting.waitTime')}>
          <NumberInput value={setting.waitTime} min={0} max={3000} step={100} onChange={v => setting.patch({ waitTime: v })} />
        </Row>
        <Row label={t('setting.inputWrongClear')}>
          <Toggle checked={setting.inputWrongClear} onChange={v => setting.patch({ inputWrongClear: v })} />
        </Row>
        <Row label={t('setting.wrongWordClear')} desc={t('setting.wrongWordClearDesc')}>
          <Toggle checked={setting.wrongWordClear} onChange={v => setting.patch({ wrongWordClear: v })} />
        </Row>
        <Row label={t('setting.perDay')}>
          <NumberInput
            value={setting.perDayStudyNumber}
            min={5}
            max={200}
            step={5}
            onChange={v => setting.patch({ perDayStudyNumber: v })}
          />
        </Row>
        <Row label={t('setting.dailyGoal')} desc={t('setting.dailyGoalDesc')}>
          <NumberInput
            value={setting.dailyGoal}
            min={5}
            max={500}
            step={5}
            onChange={v => setting.patch({ dailyGoal: v })}
          />
        </Row>
      </Section>

      <Section title={t('setting.sectionFsrs')}>
        <p className="text-xs text-dim mt-2">{t('setting.fsrsIntro')}</p>
        <Row label={t('setting.easyLimit')} desc={t('setting.easyLimitDesc')}>
          <NumberInput
            value={setting.fsrsLimits.easy}
            min={0}
            max={10}
            onChange={v => setting.patch({ fsrsLimits: { ...setting.fsrsLimits, easy: v } })}
          />
        </Row>
        <Row label={t('setting.goodLimit')} desc={t('setting.goodLimitDesc')}>
          <NumberInput
            value={setting.fsrsLimits.good}
            min={0}
            max={10}
            onChange={v => setting.patch({ fsrsLimits: { ...setting.fsrsLimits, good: Math.max(v, setting.fsrsLimits.easy) } })}
          />
        </Row>
        <Row label={t('setting.reviewRatio')} desc={t('setting.reviewRatioDesc')}>
          <NumberInput
            value={setting.reviewRatio}
            min={0}
            max={10}
            onChange={v => setting.patch({ reviewRatio: v })}
          />
        </Row>
        <Row label={t('setting.retention')} desc={t('setting.retentionDesc')}>
          <NumberInput
            value={Math.round(setting.fsrsParams.requestRetention * 100)}
            min={70}
            max={99}
            onChange={v => setting.patch({ fsrsParams: { ...setting.fsrsParams, requestRetention: v / 100 } })}
          />
        </Row>
        <Row label={t('setting.maxInterval')} desc={t('setting.maxIntervalDesc')}>
          <NumberInput
            value={setting.fsrsParams.maximumInterval}
            min={1}
            max={3650}
            onChange={v => setting.patch({ fsrsParams: { ...setting.fsrsParams, maximumInterval: v } })}
          />
        </Row>
        <Row label={t('setting.fuzz')} desc={t('setting.fuzzDesc')}>
          <Toggle
            checked={setting.fsrsParams.enableFuzz}
            onChange={v => setting.patch({ fsrsParams: { ...setting.fsrsParams, enableFuzz: v } })}
          />
        </Row>
      </Section>

      <Section title={t('setting.sectionSound')}>
        <Row label={t('setting.autoSound')}>
          <Toggle checked={setting.autoSound} onChange={v => setting.patch({ autoSound: v })} />
        </Row>
        <Row label={t('setting.volume')}>
          <input
            type="range"
            min={0}
            max={100}
            value={setting.soundVolume}
            onChange={e => setting.patch({ soundVolume: Number(e.target.value) })}
            className="w-48"
          />
          <span className="ml-2 text-sm text-dim w-10 text-right">{setting.soundVolume}%</span>
        </Row>
        <Row label={t('setting.rate')}>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={setting.soundSpeed}
            onChange={e => setting.patch({ soundSpeed: Number(e.target.value) })}
            className="w-48"
          />
          <span className="ml-2 text-sm text-dim w-10 text-right">{setting.soundSpeed}x</span>
        </Row>
        <Row label={t('setting.voice')} desc={`${t('setting.voiceDesc')} ${t('setting.voicePerLang')}`}>
          {/* 音色按界面语言分别记住：换语言不丢自己的选择 */}
          <VoicePicker
            value={setting.voiceByLang[setting.lang] ?? ''}
            onChange={voiceURI =>
              setting.patch({ voiceByLang: { ...setting.voiceByLang, [setting.lang]: voiceURI } })
            }
            rate={setting.soundSpeed}
            volume={setting.soundVolume / 100}
          />
        </Row>
        {voices.length === 0 && <p className="text-xs text-warn mt-2">{t('setting.noVoice')}</p>}
      </Section>

      <Section title={t('setting.sectionEffect')}>
        <Row label={t('setting.keySound')}>
          <Toggle checked={setting.keyboardSound} onChange={v => setting.patch({ keyboardSound: v })} />
        </Row>
        <Row label={t('setting.effectSound')}>
          <Toggle checked={setting.effectSound} onChange={v => setting.patch({ effectSound: v })} />
        </Row>
      </Section>

      <Section title={t('setting.sectionKeyboard')}>
        <Row label={t('setting.virtualKeyboard')} desc={t('setting.virtualKeyboardDesc')}>
          <Toggle checked={setting.virtualKeyboard} onChange={v => setting.patch({ virtualKeyboard: v })} />
        </Row>
        <Row label={t('setting.replayKey')} desc={t('setting.replayKeyDesc')}>
          <Segmented
            value={setting.replayKey}
            options={[
              { value: 'tab', label: 'Tab' },
              { value: 'f2', label: 'F2' },
            ]}
            onChange={v => setting.patch({ replayKey: v as ReplayKey })}
          />
        </Row>
        <Row label={t('setting.nextKey')} desc={t('setting.nextKeyDesc')}>
          <Segmented
            value={setting.nextKey}
            options={[
              { value: 'both', label: t('setting.nextKeyBoth') },
              { value: 'space', label: t('setting.nextKeySpace') },
              { value: 'enter', label: t('setting.nextKeyEnter') },
            ]}
            onChange={v => setting.patch({ nextKey: v as NextKey })}
          />
        </Row>
      </Section>

      <Section title={t('setting.sectionShortcut')}>
        <p className="text-xs text-dim mt-2">{t('setting.shortcutHint')}</p>
        {SHORTCUT_ROWS.map(([action, label]) => (
          <Row key={action} label={t(label)}>
            <select
              value={setting.shortcuts?.[action] ?? ''}
              onChange={e =>
                setting.patch({ shortcuts: { ...setting.shortcuts, [action]: e.target.value } })
              }
              className="h-9 min-w-[8rem] rounded-lg border border-line bg-surface px-2 text-sm"
            >
              <option value="">{t('setting.shortcutNone')}</option>
              {SHORTCUT_KEYS.map(k => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </Row>
        ))}
        {conflict && <p className="text-xs text-warn mt-2">{t('setting.shortcutConflict')}</p>}
      </Section>

      <Section title={t('setting.sectionAppearance')}>
        <Row label={t('setting.theme')} desc={t('setting.themeDesc')}>
          <Segmented
            value={setting.theme}
            options={[
              { value: 'system', label: t('setting.themeSystem') },
              { value: 'light', label: t('setting.themeLight') },
              { value: 'dark', label: t('setting.themeDark') },
            ]}
            onChange={v => setting.patch({ theme: v as ThemeMode })}
          />
        </Row>
      </Section>

      <Section title={t('setting.sectionData')}>
        {importMsg && (
          <div
            className={`text-sm px-4 py-3 rounded-lg border ${
              importMsg.ok ? 'border-ok/50 bg-ok/10 text-ok' : 'border-err/50 bg-err/10 text-err'
            }`}
          >
            {importMsg.text}
          </div>
        )}
        <Row label={t('setting.exportBackup')} desc={t('setting.exportBackupDesc')}>
          <button
            onClick={() => {
              const blob = new Blob([base.exportData()], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `typingchinese-backup-${new Date().toISOString().slice(0, 10)}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="h-9 px-4 rounded-lg border border-line text-sm hover:bg-surface2"
          >
            {t('common.export')}
          </button>
        </Row>
        <Row label={t('setting.importMerge')}>
          <Toggle checked={mergeImport} onChange={setMergeImport} />
        </Row>
        <Row label={t('setting.importBackup')}>
          <>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0]
                if (!file) return
                const result = base.importData(await file.text(), mergeImport ? 'merge' : 'replace')
                setImportMsg({ ok: result.ok, text: t(`errors.${result.code}` as MessageKey) })
                if (fileRef.current) fileRef.current.value = ''
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="h-9 px-4 rounded-lg border border-line text-sm hover:bg-surface2"
            >
              {t('common.import')}
            </button>
          </>
        </Row>
        <Row label={t('setting.resetSetting')}>
          <button
            onClick={() => setting.reset()}
            className="h-9 px-4 rounded-lg border border-line text-sm hover:bg-surface2"
          >
            {t('setting.resetBtn')}
          </button>
        </Row>

        {/* 存储与同步状态：全部数据都在 localStorage，这两条不显示出来就是隐患 */}
        <Row label={t('setting.storageUsage', { n: storage.usage || '-' })}>
          <span className="text-sm text-dim">
            {writeError === 'quota' ? t('setting.storageFull') : ''}
          </span>
        </Row>
        {(writeError || storage.level !== 'ok') && (
          <div className="rounded-lg border border-warn/50 bg-warn/10 px-4 py-3 text-sm text-warn">
            {t('setting.storageFull')}
          </div>
        )}
        {syncedAt > 0 && <p className="text-xs text-dim mt-2">{t('setting.tabSynced')}</p>}
      </Section>

      <Section title={t('community.title')}>
        <p className="text-xs text-dim">{t('community.desc')}</p>
        <CommunityLinks variant="rows" />
      </Section>
    </Page>
  )
}

/** 可自定义的功能键：顺序与练习页生效优先级一致 */
const SHORTCUT_ROWS: [ShortcutAction, MessageKey][] = [
  ['skip', 'setting.scSkip'],
  ['pinyin', 'setting.scPinyin'],
  ['trans', 'setting.scTrans'],
  ['known', 'setting.scKnown'],
  ['collect', 'setting.scCollect'],
  ['detail', 'setting.scDetail'],
]

/** 候选键：避开浏览器占用的 F1 / F5 / F11 / F12 */
const SHORTCUT_KEYS = [
  { value: 'Escape', label: 'Esc' },
  { value: 'F2', label: 'F2' },
  { value: 'F3', label: 'F3' },
  { value: 'F4', label: 'F4' },
  { value: 'F6', label: 'F6' },
  { value: 'F7', label: 'F7' },
  { value: 'F8', label: 'F8' },
  { value: 'F9', label: 'F9' },
  { value: 'F10', label: 'F10' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Panel title={title} className="mb-6">
      <div className="flex flex-col gap-4">{children}</div>
    </Panel>
  )
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm">{label}</div>
        {desc && <div className="text-xs text-dim mt-1">{desc}</div>}
      </div>
      <div className="flex items-center">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-brand' : 'bg-surface2'}`}
    >
      <span
        className={`block w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="inline-flex rounded-lg border border-line overflow-hidden">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`h-9 px-4 text-sm ${value === o.value ? 'bg-brand text-white' : 'hover:bg-surface2'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function NumberInput({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={e => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
      className="h-9 w-24 rounded-lg border border-line bg-surface px-2 text-sm"
    />
  )
}

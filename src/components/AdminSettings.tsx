import { useState, useRef, useEffect } from 'react'
import {
  Clock,
  Save,
  Check,
  ListChecks,
  Info,
  CircleDollarSign,
} from 'lucide-react'
import { SCHEDULE_OPTIONS } from '../utils/schedule'
import { translations, type Lang } from '../i18n'

interface AdminSettingsProps {
  fee: number
  onFeeChange: (value: number) => void
  rules: string[]
  onRulesChange: (value: string[]) => void
  lang: Lang
}

const panelCls =
  'rounded-2xl bg-marine border border-white/[0.06] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] overflow-hidden'

const unifiedFieldCls =
  'rounded-lg bg-white/[0.04] border border-white/[0.12] transition-all duration-150 focus-within:border-[#20B1EE] focus-within:shadow-[0_0_0_3px_rgba(32,177,238,0.15)]'

export default function AdminSettings({
  fee,
  onFeeChange,
  rules,
  onRulesChange,
  lang,
}: AdminSettingsProps) {
  const t = translations[lang]
  const [feeDraft, setFeeDraft] = useState(String(fee))
  const [rulesDraft, setRulesDraft] = useState(rules.join('\n'))
  const [feeSaved, setFeeSaved] = useState(false)
  const [rulesSaved, setRulesSaved] = useState(false)
  const feeTimer = useRef<number | null>(null)
  const rulesTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (feeTimer.current) window.clearTimeout(feeTimer.current)
      if (rulesTimer.current) window.clearTimeout(rulesTimer.current)
    },
    [],
  )

  const commitFee = () => {
    const next = Math.max(0, Math.min(10000, Math.floor(Number(feeDraft) || 0)))
    onFeeChange(next)
    setFeeDraft(String(next))
    setFeeSaved(true)
    if (feeTimer.current) window.clearTimeout(feeTimer.current)
    feeTimer.current = window.setTimeout(() => setFeeSaved(false), 2000)
  }

  const handleSaveRules = () => {
    const nextRules = rulesDraft.split('\n').map((r) => r.trim()).filter(Boolean)
    onRulesChange(nextRules)
    setRulesSaved(true)
    if (rulesTimer.current) window.clearTimeout(rulesTimer.current)
    rulesTimer.current = window.setTimeout(() => setRulesSaved(false), 2500)
  }

  return (
    <div className="mx-auto w-full max-w-[1000px] py-2 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {t.admin.pageSettingsTitle}
        </h1>
        <p className="mt-2 text-sm text-[#94A3B8]">{t.admin.pageSettingsSub}</p>
      </div>

      <div className={`mt-6 ${panelCls}`}>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 px-5 sm:px-7 py-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-[10px] bg-[#20B1EE]/10 border border-[#20B1EE]/20 flex items-center justify-center">
              <CircleDollarSign className="w-5 h-5 text-[#20B1EE]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold text-white">
                {t.admin.settingsFeeLabel}
              </h2>
              <p className="mt-0.5 text-sm text-[#94A3B8] leading-snug">
                {t.admin.settingsFeeDesc}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 shrink-0">
            <div className={`inline-flex items-center ${unifiedFieldCls}`}>
              <span className="flex items-center gap-1 h-10 pl-3.5 pr-3 text-[0.9rem] font-medium text-[#94A3B8] border-r border-white/[0.08] select-none">
                $ <span className="text-xs uppercase tracking-wider">USD</span>
              </span>
              <input
                type="number"
                min={0}
                max={10000}
                value={feeDraft}
                onChange={(e) => setFeeDraft(e.target.value)}
                onBlur={commitFee}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitFee()
                }}
                className="no-spin h-10 w-24 px-3 bg-transparent border-0 text-[1.1rem] font-semibold text-white tabular-nums placeholder:text-white/30 focus:outline-none focus:ring-0"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-[#94A3B8]">{t.admin.settingsFeeHelp}</p>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold transition-opacity duration-300 ${
                  feeSaved ? 'text-emerald-300 opacity-100' : 'text-[#94A3B8] opacity-0'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                {t.admin.settingsAutosaved}
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/[0.06]" />

        <div className="px-5 sm:px-7 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-[10px] bg-[#20B1EE]/10 border border-[#20B1EE]/20 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-[#20B1EE]" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-white">
                {t.admin.settingsRulesLabel}
              </h2>
              <p className="mt-0.5 text-sm text-[#94A3B8]">
                {t.admin.settingsRulesHint}
              </p>
            </div>
          </div>

          <div className={`mt-5 ${unifiedFieldCls}`}>
            <textarea
              value={rulesDraft}
              onChange={(e) => setRulesDraft(e.target.value)}
              rows={7}
              placeholder={t.admin.settingsRulesPlaceholder}
              className="w-full bg-transparent px-4 py-3 text-sm text-white leading-relaxed placeholder:text-white/30 focus:outline-none resize-y"
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8]">
              <Info className="w-3.5 h-3.5 text-[#20B1EE] shrink-0" />
              {t.admin.settingsRulesInlineHint}
            </p>
            <div className="flex items-center justify-end gap-3">
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity duration-300 ${
                  rulesSaved ? 'text-emerald-300 opacity-100' : 'opacity-0'
                }`}
              >
                <Check className="w-4 h-4" />
                {t.admin.settingsSaved}
              </span>
              <button
                onClick={handleSaveRules}
                className="inline-flex items-center gap-2 px-5 h-10 rounded-xl bg-gradient-to-r from-[#20B1EE] to-[#1895C7] text-white text-sm font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-[0_12px_28px_-12px_rgba(32,177,238,0.55)]"
              >
                <Save className="w-4 h-4" />
                {t.admin.settingsSave}
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/[0.06]" />

        <div className="px-5 sm:px-7 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-[10px] bg-[#20B1EE]/10 border border-[#20B1EE]/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#20B1EE]" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-white">
                {t.admin.settingsSchedulesLabel}
              </h2>
              <p className="mt-0.5 text-sm text-[#94A3B8]">{t.admin.settingsUsageHint}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {SCHEDULE_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                className="flex items-center gap-3 rounded-lg bg-white/[0.04] border border-white/[0.12] px-4 py-3"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${opt.dot} shrink-0`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {opt.value === '9 am a 6 pm' ? t.booking.turnDay : t.booking.turnNight}
                  </p>
                  <p className="text-xs text-[#94A3B8]">{opt.hours}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
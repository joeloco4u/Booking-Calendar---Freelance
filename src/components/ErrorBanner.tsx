import { AlertTriangle, RefreshCw } from 'lucide-react'
import { translations, type Lang } from '../i18n'

interface ErrorBannerProps {
  lang: Lang
  onRetry?: () => void
}

export default function ErrorBanner({ lang, onRetry }: ErrorBannerProps) {
  const t = translations[lang]
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
      <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
      <p className="flex-1 leading-relaxed">{t.errors.server}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {t.errors.retry}
        </button>
      )}
    </div>
  )
}

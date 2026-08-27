import { translations, type Lang } from '../i18n'

interface FacilityLandingProps {
  lang: Lang
}

export default function FacilityLanding({ lang }: FacilityLandingProps) {
  const t = translations[lang]

  return (
    <div className="animate-fade-in-up text-center px-2">
      <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight text-balance leading-snug">
        {t.facility.heroTitle}{' '}
        <span className="bg-gradient-to-r from-cyan-glow to-cyan-cta bg-clip-text text-transparent">
          {t.facility.heroHighlight}
        </span>
      </h1>
      <p className="mt-2 text-sm md:text-base text-white/65 max-w-xl mx-auto leading-relaxed">
        {t.facility.heroSub}
      </p>
    </div>
  )
}
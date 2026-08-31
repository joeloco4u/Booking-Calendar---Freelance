import Header, { type AdminSection } from './Header'
import type { Lang } from '../i18n'

export type { AdminSection }

interface LayoutProps {
  children: React.ReactNode
  headerTitle: string
  headerSubtitle?: string
  role: 'freelancer' | 'admin'
  lang: Lang
  activeSection: AdminSection | null
  onNavigate: (section: AdminSection) => void
  onLangChange: (lang: Lang) => void
}

export default function Layout({
  children,
  headerTitle,
  headerSubtitle,
  role,
  lang,
  activeSection,
  onNavigate,
  onLangChange,
}: LayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-[#0F172A] overflow-hidden">
      <Header
        title={headerTitle}
        subtitle={headerSubtitle}
        role={role}
        lang={lang}
        activeSection={activeSection}
        onNavigate={onNavigate}
        onLangChange={onLangChange}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6 space-y-6">{children}</main>
    </div>
  )
}
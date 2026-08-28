import Header from './Header'
import type { Lang } from '../i18n'

interface LayoutProps {
  children: React.ReactNode
  headerTitle: string
  headerSubtitle?: string
  role: 'freelancer' | 'admin'
  lang: Lang
  onLangChange: (lang: Lang) => void
  onRoleChange: (role: 'freelancer' | 'admin') => void
  onBookNow: () => void
}

export default function Layout({
  children,
  headerTitle,
  headerSubtitle,
  role,
  lang,
  onLangChange,
  onRoleChange,
  onBookNow,
}: LayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-[#0F172A] overflow-hidden">
      <Header
        title={headerTitle}
        subtitle={headerSubtitle}
        role={role}
        lang={lang}
        onLangChange={onLangChange}
        onRoleChange={onRoleChange}
        onBookNow={onBookNow}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6 space-y-6">{children}</main>
    </div>
  )
}
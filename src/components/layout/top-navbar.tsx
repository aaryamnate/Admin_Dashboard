'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useSession } from '@/hooks/use-auth'
import { useSettings } from '@/hooks/use-settings'
import { LogoutConfirmModal } from '@/components/layout/logout-modal'
import {
  Bell,
  Search,
  Moon,
  Sun,
  Dumbbell,
  LogOut,
  LayoutDashboard,
  Users,
  CreditCard,
  GitBranch,
  ChevronDown,
  HeartPulse,
  Apple,
  Settings,
  BarChart3,
  Globe,
  Building2,
} from 'lucide-react'

export function TopNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { data: sessionUser } = useSession()
  const { data: gymSettings } = useSettings()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Dropdown states
  const [profileOpen, setProfileOpen] = useState(false)
  const [trackingOpen, setTrackingOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  
  const profileRef = useRef<HTMLDivElement>(null)
  const trackingRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
      if (trackingRef.current && !trackingRef.current.contains(event.target as Node)) {
        setTrackingOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Close all dropdowns when route/pathname changes
  useEffect(() => {
    setProfileOpen(false)
    setTrackingOpen(false)
    setSearchOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (e) {
      console.error('Logout error:', e)
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch {}
      window.location.href = '/login'
    }
  }

  // Navigation Items
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Members', href: '/members', icon: Users },
    { label: 'Memberships', href: '/memberships', icon: CreditCard },
    { label: 'Trainers', href: '/trainers', icon: Dumbbell },
    { label: 'Allocations', href: '/allocations', icon: GitBranch },
  ]

  const trackingItems = [
    { label: 'Health Metrics', href: '/health-metrics', icon: HeartPulse },
    { label: 'Nutrition', href: '/nutrition', icon: Apple },
  ]

  const isTrackingActive = pathname === '/health-metrics' || pathname === '/nutrition'

  return (
    <div className="sticky top-4 z-40 w-[calc(100%-2rem)] max-w-7xl mx-auto rounded-2xl border border-border/45 bg-card/45 backdrop-blur-xl shadow-xl shadow-black/20 transition-all duration-300">
      {/* Upper Header Row */}
      <header className="flex h-16 items-center justify-between px-4 md:px-8 border-b border-border/40">
        {/* Left: Brand/Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 transform hover:scale-[1.02] transition-all">
          <div className="relative h-10 w-10 rounded-xl overflow-hidden shadow-lg shadow-primary/10 border border-primary/30 bg-[#20252b] flex items-center justify-center p-0.5">
            {(gymSettings?.logoUrl || (sessionUser as any)?.activeGym?.logoUrl) ? (
              <img
                src={gymSettings?.logoUrl || (sessionUser as any)?.activeGym?.logoUrl}
                alt={gymSettings?.gymName || (sessionUser as any)?.activeGym?.name || 'Gym Logo'}
                className="h-full w-full object-contain"
              />
            ) : (
              <Image
                src="/assets/vyayam-ai-logo.png"
                alt="VYAYAM AI"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-primary leading-none">VYAYAM AI</span>
            <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mt-0.5">Executive Portal</span>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Search Trigger */}
          <div ref={searchRef} className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-[18px] w-[18px]" />
            </Button>
            {searchOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card p-2 shadow-xl animate-slide-down">
                <input
                  type="text"
                  placeholder="Quick search..."
                  className="w-full rounded-lg bg-background border border-border px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {!mounted ? (
              <div className="h-[18px] w-[18px]" />
            ) : theme === 'dark' ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </Button>

          {/* Notifications */}
          <Link href="/notifications">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            </Button>
          </Link>

          {/* User Profile Dropdown */}
          <div ref={profileRef} className="relative ml-1">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 focus:outline-none cursor-pointer group"
            >
              <Avatar fallback={sessionUser?.name?.charAt(0) || 'A'} size="sm" className="ring-2 ring-primary/20 group-hover:ring-primary/45 transition-all" />
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-slide-down">
                <div className="px-3 py-2.5 border-b border-border/40 mb-1">
                  <p className="text-sm font-bold text-foreground truncate">{sessionUser?.name || 'Aarya Nate'}</p>
                  <p className="text-xs text-muted-foreground truncate">{sessionUser?.email || 'aarya210706@gmail.com'}</p>
                  {(gymSettings?.gymName || (sessionUser as any)?.activeGym?.name) && (
                    <div className="mt-1.5 flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary truncate">
                      <Building2 className="h-3 w-3 shrink-0" />
                      <span className="truncate">{gymSettings?.gymName || (sessionUser as any)?.activeGym?.name}</span>
                    </div>
                  )}
                </div>
                <Link href="/" onClick={() => setProfileOpen(false)}>
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted/50 cursor-pointer">
                    <Globe className="h-4 w-4 text-primary" />
                    <span>Company Landing Page</span>
                  </div>
                </Link>
                <Link href="/settings" onClick={() => setProfileOpen(false)}>
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted/50 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span>Gym Settings</span>
                  </div>
                </Link>
                <div
                  onClick={() => {
                    setProfileOpen(false)
                    setShowLogoutModal(true)
                  }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 cursor-pointer border-t border-border/30 mt-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Lower Navigation Tabs Row */}
      <nav className="hidden md:flex items-center px-4 md:px-8 overflow-x-auto md:overflow-visible scrollbar-none h-12">
        <div className="flex items-center gap-1 md:gap-2 h-full">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 h-full text-sm font-medium border-b-2 transition-all relative whitespace-nowrap',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          {/* Tracking Dropdown */}
          <div ref={trackingRef} className="h-full relative flex items-center">
            <button
              onClick={() => setTrackingOpen(!trackingOpen)}
              className={cn(
                'flex items-center gap-1.5 px-3 h-full text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap',
                isTrackingActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <HeartPulse className="h-4 w-4" />
              <span>Tracking</span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", trackingOpen && "rotate-180")} />
            </button>
            {trackingOpen && (
              <div className="absolute left-0 top-full mt-1 w-48 rounded-xl border border-border bg-card p-1 shadow-xl animate-slide-down z-50 hidden md:block">
                {trackingItems.map((sub) => {
                  const SubIcon = sub.icon
                  const isSubActive = pathname === sub.href
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setTrackingOpen(false)}
                    >
                      <div
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer',
                          isSubActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground hover:bg-muted/50'
                        )}
                      >
                        <SubIcon className="h-4 w-4" />
                        <span>{sub.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Inline sub-items on mobile/tablet */}
          {trackingOpen && (
            <div className="flex items-center gap-1.5 md:hidden border-l border-border/40 pl-2 ml-1 animate-fade-in">
              {trackingItems.map((sub) => {
                const SubIcon = sub.icon
                const isSubActive = pathname === sub.href
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setTrackingOpen(false)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border border-border/30 bg-muted/30',
                      isSubActive
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <SubIcon className="h-3.5 w-3.5" />
                    <span>{sub.label}</span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Reports tab */}
          <Link
            href="/reports"
            className={cn(
              'flex items-center gap-2 px-3 h-full text-sm font-medium border-b-2 transition-all whitespace-nowrap',
              pathname === '/reports'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Reports</span>
          </Link>

          {/* Settings tab */}
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-2 px-3 h-full text-sm font-medium border-b-2 transition-all whitespace-nowrap',
              pathname === '/settings'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      {/* Bottom Navigation Bar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden flex justify-around items-center h-20 px-2 pb-4 bg-card/90 backdrop-blur-xl border-t border-border/40 shadow-2xl rounded-t-2xl z-50">
        {[
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Members', href: '/members', icon: Users },
          { label: 'Trainers', href: '/trainers', icon: Dumbbell },
          { label: 'Analytics', href: '/health-metrics', icon: HeartPulse },
          { label: 'Settings', href: '/settings', icon: Settings },
        ].map((item) => {
          const SubIcon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-1.5 transition-all active:scale-95 rounded-full",
                isActive
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground opacity-70 hover:opacity-100"
              )}
            >
              <SubIcon className="h-5 w-5" />
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </div>
  )
}

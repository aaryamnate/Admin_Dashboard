'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LogoutConfirmModal } from '@/components/layout/logout-modal'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/constants'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Dumbbell,
  GitBranch,
  HeartPulse,
  Apple,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { useSession } from '@/hooks/use-auth'
import { useSettings } from '@/hooks/use-settings'

// Map icon names from constants to Lucide components
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  CreditCard,
  Dumbbell,
  GitBranch,
  HeartPulse,
  Apple,
  Bell,
  BarChart3,
  Settings,
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: sessionUser } = useSession()
  const { data: gymSettings } = useSettings()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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

  const gymLogo = gymSettings?.logoUrl || (sessionUser as any)?.activeGym?.logoUrl

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-primary/30 bg-[#20252b] flex items-center justify-center shrink-0 p-0.5">
              {gymLogo ? (
                <img
                  src={gymLogo}
                  alt={gymSettings?.gymName || (sessionUser as any)?.activeGym?.name || 'Gym Logo'}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Image
                  src="/assets/vyayam-ai-logo.png"
                  alt="VYAYAM AI"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <span className="text-lg font-bold gradient-text">VYAYAM AI</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto relative h-8 w-8 rounded-lg overflow-hidden border border-primary/30 bg-[#20252b] flex items-center justify-center p-0.5">
            {gymLogo ? (
              <img
                src={gymLogo}
                alt={gymSettings?.gymName || (sessionUser as any)?.activeGym?.name || 'Gym Logo'}
                className="h-full w-full object-contain"
              />
            ) : (
              <Image
                src="/assets/vyayam-ai-logo.png"
                alt="VYAYAM AI"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            )}
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_ITEMS.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {section.section}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = iconMap[item.icon] || LayoutDashboard
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const isHovered = hoveredItem === item.href

                return (
                  <li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      onMouseEnter={() => setHoveredItem(item.href)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-primary shadow-sm'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                      )}
                    >
                      <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-primary')} />
                      {!collapsed && <span>{item.label}</span>}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-primary" />
                      )}
                    </Link>

                    {/* Tooltip on collapsed */}
                    {collapsed && isHovered && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 rounded-md bg-popover px-3 py-1.5 text-xs font-medium text-popover-foreground shadow-lg border border-border whitespace-nowrap animate-fade-in">
                        {item.label}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-accent transition-colors cursor-pointer"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* User section */}
      <div className="border-t border-border p-3">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar fallback={sessionUser?.name?.charAt(0) || 'A'} size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{sessionUser?.name || 'Aarya Nate'}</p>
              <p className="text-xs text-muted-foreground truncate">{sessionUser?.email || 'admin@vyayam.ai'}</p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </aside>
  )
}

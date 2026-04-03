'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, MessageCircle, User, Heart, AlertCircle } from 'lucide-react'

export type NavVariant = 'default' | 'saved' | 'admin'

interface NavItem {
  name: string
  label: string
  href: string
  Icon: React.FC<{ size?: number; className?: string; strokeWidth?: number }>
}

const defaultNavItems: NavItem[] = [
  { name: 'home', label: '홈', href: '/', Icon: Home },
  { name: 'search', label: '검색', href: '/search', Icon: Search },
  { name: 'chat', label: '채팅', href: '/chat', Icon: MessageCircle },
  { name: 'profile', label: '프로필', href: '/profile/settings', Icon: User },
]

const savedNavItems: NavItem[] = [
  { name: 'home', label: '홈', href: '/', Icon: Home },
  { name: 'search', label: '검색', href: '/search', Icon: Search },
  { name: 'saved', label: '저장', href: '/saved', Icon: Heart },
  { name: 'profile', label: '프로필', href: '/profile/settings', Icon: User },
]

const adminNavItems: NavItem[] = [
  { name: 'home', label: '홈', href: '/', Icon: Home },
  { name: 'search', label: '검색', href: '/search', Icon: Search },
  { name: 'report', label: '신고', href: '/report', Icon: AlertCircle },
  { name: 'profile', label: '프로필', href: '/profile/settings', Icon: User },
]

interface BottomNavBarProps {
  variant?: NavVariant
}

export default function BottomNavBar({ variant = 'default' }: BottomNavBarProps) {
  const pathname = usePathname()

  const navItems =
    variant === 'saved'
      ? savedNavItems
      : variant === 'admin'
      ? adminNavItems
      : defaultNavItems

  function isActive(item: NavItem): boolean {
    if (item.href === '/') return pathname === '/'
    return pathname.startsWith(item.href)
  }

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-40 bg-white border-t border-zinc-50"
      style={{
        maxWidth: '680px',
        height: '80px',
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
        boxShadow: '0px -10px 40px 0px rgba(0,0,0,0.03)',
      }}
      aria-label="하단 내비게이션"
      role="navigation"
    >
      <div className="flex items-center justify-around h-full px-4 pt-1">
        {navItems.map((item) => {
          const active = isActive(item)
          const { Icon } = item
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className="flex flex-col items-center justify-center gap-1 w-full h-full transition-colors"
            >
              <Icon
                size={active ? 20 : 20}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? 'text-zinc-900' : 'text-zinc-300'}
              />
              <span
                className={`text-[10px] font-medium leading-none transition-colors ${
                  active ? 'text-zinc-900 font-bold' : 'text-zinc-300'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

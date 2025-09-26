"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Globe2, Smile, User2 } from "lucide-react"

function NavBtn({
  active,
  children,
  label,
  href,
}: {
  active?: boolean
  children: React.ReactNode
  label: string
  href: string
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={[
        "h-12 flex-1 rounded-2xl grid place-items-center",
        active ? "bg-[color:var(--gumo-yellow)] text-black" : "bg-[color:var(--gumo-surface)] text-white/70",
      ].join(" ")}
    >
      {children}
    </Link>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Primary" className="gumo-card flex items-center gap-3 p-2">
      <NavBtn href="/" active={pathname === "/"} label="Home">
        <Smile className="size-6" aria-hidden />
      </NavBtn>
      <NavBtn href="/explore" active={pathname?.startsWith("/explore")} label="Discover">
        <Globe2 className="size-6" aria-hidden />
      </NavBtn>
      <NavBtn href="/profile" active={pathname?.startsWith("/profile")} label="Profile">
        <User2 className="size-6" aria-hidden />
      </NavBtn>
    </nav>
  )
}

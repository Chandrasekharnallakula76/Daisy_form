import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const PETALS = [
  { rotate: -45, from: "#34d399", to: "#059669" },
  { rotate: 45, from: "#2dd4bf", to: "#0d9488" },
  { rotate: 135, from: "#38bdf8", to: "#0284c7" },
  { rotate: 225, from: "#4ade80", to: "#16a34a" },
]

export function DaisyMark({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden
      className={cn("size-10", className)}
      {...props}
    >
      <defs>
        {PETALS.map((p, i) => (
          <linearGradient key={i} id={`petal-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.from} />
            <stop offset="1" stopColor={p.to} />
          </linearGradient>
        ))}
      </defs>
      {PETALS.map((p, i) => (
        <path
          key={i}
          d="M24 24 C 17 18, 17 6, 24 2 C 31 6, 31 18, 24 24 Z"
          fill={`url(#petal-${i})`}
          transform={`rotate(${p.rotate} 24 24)`}
        />
      ))}
    </svg>
  )
}

export function DaisyLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <DaisyMark />
      <span className="text-3xl font-bold tracking-tight text-[#0f3b3a] dark:text-foreground">
        DAISY
      </span>
    </div>
  )
}

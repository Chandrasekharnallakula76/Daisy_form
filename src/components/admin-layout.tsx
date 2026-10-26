import type { ReactNode } from "react"

import { DaisyLogo } from "@/components/brand"
import { RouteLink } from "@/components/route-link"

export const adminLinkClass =
  "rounded-sm text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"

export function AdminLayout({
  children,
  headerActions,
}: {
  children: ReactNode
  headerActions?: ReactNode
}) {
  return (
    <div className="min-h-svh min-w-0 bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-[1680px] min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-4 px-5 py-5 sm:px-8 sm:py-6">
          <RouteLink
            page="form"
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            aria-label="Daisy Intelligence event form"
          >
            <DaisyLogo />
          </RouteLink>
          {headerActions}
        </div>
      </header>
      {children}
    </div>
  )
}

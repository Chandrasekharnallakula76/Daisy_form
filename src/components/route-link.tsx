import type { ComponentProps } from "react"

import { appHref, navigate, type AppPage } from "@/lib/routes"

type RouteLinkProps = Omit<ComponentProps<"a">, "href"> & { page: AppPage }

export function RouteLink({ page, onClick, target, ...props }: RouteLinkProps) {
  return (
    <a
      {...props}
      href={appHref(page)}
      target={target}
      onClick={(event) => {
        onClick?.(event)
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          (target && target !== "_self")
        ) {
          return
        }
        event.preventDefault()
        navigate(page)
      }}
    />
  )
}

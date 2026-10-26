import { useSyncExternalStore } from "react"

import App from "@/App"
import { AdminLayout, adminLinkClass } from "@/components/admin-layout"
import { RouteLink } from "@/components/route-link"
import { appHref, routeForPath } from "@/lib/routes"
import { AdminPage } from "@/pages/admin"
import { LoginPage } from "@/pages/login"

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange)
  return () => window.removeEventListener("popstate", onChange)
}

export function AppRouter() {
  const pathname = useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => appHref("form")
  )

  switch (routeForPath(pathname)) {
    case "form":
      return <App />
    case "login":
      return <LoginPage />
    case "admin":
      return <AdminPage />
    default:
      return (
        <AdminLayout>
          <main className="mx-auto w-full max-w-md px-5 py-12 sm:px-8 sm:py-20">
            <h1 className="text-3xl font-semibold tracking-tight">
              Page not found
            </h1>
            <RouteLink
              page="form"
              className={`${adminLinkClass} mt-5 inline-block`}
            >
              Back to event form
            </RouteLink>
          </main>
        </AdminLayout>
      )
  }
}

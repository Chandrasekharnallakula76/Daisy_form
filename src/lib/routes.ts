export type AppPage = "form" | "login" | "admin"
export type AppRoute = AppPage | "not-found"

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/+$/, "")

export function appHref(page: AppPage) {
  return `${BASE_PATH}/${page === "form" ? "" : page}`
}

export function routeForPath(pathname: string): AppRoute {
  const path = pathname.replace(/\/+$/, "")
  if (path === BASE_PATH) return "form"
  if (path === `${BASE_PATH}/login`) return "login"
  if (path === `${BASE_PATH}/admin`) return "admin"
  return "not-found"
}

export function navigate(page: AppPage, replace = false) {
  const href = appHref(page)
  if (replace) window.history.replaceState(null, "", href)
  else window.history.pushState(null, "", href)
  window.dispatchEvent(new Event("popstate"))
  window.scrollTo(0, 0)
}

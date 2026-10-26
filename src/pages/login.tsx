import { useEffect, useState, type FormEvent } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"

import { AdminLayout, adminLinkClass } from "@/components/admin-layout"
import { RouteLink } from "@/components/route-link"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ApiError, getAdminSession, loginAdmin } from "@/lib/api"
import { navigate } from "@/lib/routes"

function signInError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "The email or password is incorrect."
    if (error.status === 429) {
      return "Too many sign-in attempts. Please wait a few minutes and try again."
    }
    if (error.status === 403) {
      return "We couldn't complete sign-in. Reload this page and try again."
    }
  }
  return "We couldn't reach the sign-in service. Please try again."
}

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [checkingSession, setCheckingSession] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getAdminSession()
      .then(() => {
        if (active) navigate("admin", true)
      })
      .catch((error: unknown) => {
        if (!active) return
        if (!(error instanceof ApiError && error.status === 401)) {
          setError("We couldn't check your session. Please try signing in.")
        }
        setCheckingSession(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await loginAdmin({ email: email.trim(), password })
      setPassword("")
      navigate("admin", true)
    } catch (error) {
      setError(signInError(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout
      headerActions={
        <RouteLink page="form" className={adminLinkClass}>
          Event form
        </RouteLink>
      }
    >
      <main className="mx-auto w-full max-w-md px-5 py-12 sm:px-8 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight">Admin login</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Sign in to view and download event form responses.
        </p>

        {checkingSession ? (
          <p
            role="status"
            className="mt-8 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2
              aria-hidden
              className="size-4 animate-spin motion-reduce:animate-none"
            />
            Checking your session…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8">
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="admin-email">Email</FieldLabel>
                <Input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-describedby={error ? "login-error" : undefined}
                  className="h-11 bg-background px-3.5 text-base sm:text-sm"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="admin-password">Password</FieldLabel>
                <Input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-describedby={error ? "login-error" : undefined}
                  className="h-11 bg-background px-3.5 text-base sm:text-sm"
                />
              </Field>
              {error && (
                <p
                  id="login-error"
                  role="alert"
                  className="text-sm leading-relaxed text-destructive"
                >
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={submitting}
                className="h-11 w-full bg-foreground text-background hover:bg-foreground/90"
              >
                {submitting && (
                  <Loader2
                    aria-hidden
                    className="size-4 animate-spin motion-reduce:animate-none"
                  />
                )}
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </FieldGroup>
          </form>
        )}

        <RouteLink
          page="form"
          className={`${adminLinkClass} mt-8 inline-flex items-center gap-2`}
        >
          <ArrowLeft aria-hidden className="size-4" />
          Back to event form
        </RouteLink>
      </main>
    </AdminLayout>
  )
}

import { useCallback, useEffect, useRef, useState } from "react"
import { Download, Loader2, LogOut, RefreshCw } from "lucide-react"

import { AdminLayout, adminLinkClass } from "@/components/admin-layout"
import { RouteLink } from "@/components/route-link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ApiError,
  exportInquiries,
  getAdminSession,
  getInquiries,
  logoutAdmin,
  type AdminSession,
  type InquiryRecord,
} from "@/lib/api"
import {
  formatOptions,
  formatTimestamp,
  formatValue,
} from "@/lib/inquiry-display"
import { navigate } from "@/lib/routes"

type LoadState = "loading" | "ready" | "error"
type Action = "download" | "logout" | null

function ResponsesTable({ records }: { records: InquiryRecord[] }) {
  return (
    <Table
      className="min-w-[1500px] table-fixed"
      containerProps={{
        role: "region",
        tabIndex: 0,
        "aria-label":
          "Event form responses. Scroll horizontally to view all fields.",
        className:
          "min-w-0 max-w-full rounded-xl border outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [scrollbar-color:var(--border)_var(--background)]",
      }}
    >
      <TableCaption className="sr-only">
        Event form responses, newest first. All submitted fields.
      </TableCaption>
      <TableHeader className="bg-muted/60">
        <TableRow className="hover:bg-transparent">
          {[
            ["Submitted at", "w-48"],
            ["Full name", "w-44"],
            ["Company / organization", "w-52"],
            ["Business email", "w-56"],
            ["Job title", "w-44"],
            ["Phone number", "w-44"],
            ["Interests", "w-60"],
            ["Other interest", "w-56"],
            ["Preferred follow-up", "w-52"],
            ["Questions or comments", "w-80"],
            ["Response ID", "w-64"],
          ].map(([label, width]) => (
            <TableHead
              key={label}
              scope="col"
              className={`${width} px-4 py-3 text-xs font-semibold`}
            >
              {label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record, index) => (
          <TableRow
            key={record.id || index}
            className="[&>td]:px-4 [&>td]:py-4 [&>td]:align-top [&>td]:[overflow-wrap:anywhere] [&>td]:whitespace-normal"
          >
            <TableCell className="tabular-nums">
              <time dateTime={record.submittedAt} title={record.submittedAt}>
                {formatTimestamp(record.submittedAt)}
              </time>
            </TableCell>
            <TableCell className="font-medium">
              {formatValue(record.fullName)}
            </TableCell>
            <TableCell>{formatValue(record.companyOrganization)}</TableCell>
            <TableCell>{formatValue(record.businessEmail)}</TableCell>
            <TableCell>{formatValue(record.jobTitle)}</TableCell>
            <TableCell className="tabular-nums">
              {formatValue(record.phoneNumber)}
            </TableCell>
            <TableCell>
              {formatOptions(record.interests, "interests")}
            </TableCell>
            <TableCell>{formatValue(record.interestOther)}</TableCell>
            <TableCell>
              {formatOptions(record.preferredFollowUpMethods, "followUp")}
            </TableCell>
            <TableCell>
              <div className="max-w-80 [overflow-wrap:anywhere] whitespace-pre-wrap">
                {formatValue(record.questionsOrComments)}
              </div>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {formatValue(record.id)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [records, setRecords] = useState<InquiryRecord[]>([])
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [action, setAction] = useState<Action>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const loadGeneration = useRef(0)

  const expireSession = useCallback(() => {
    setRecords([])
    setSession(null)
    navigate("login", true)
  }, [])

  const loadResponses = useCallback(() => {
    const generation = ++loadGeneration.current
    let verified = false
    return getAdminSession()
      .then(async (currentSession) => {
        if (generation !== loadGeneration.current) return
        verified = true
        setSession(currentSession)
        const inquiries = await getInquiries()
        if (generation !== loadGeneration.current) return
        setRecords(inquiries)
        setLoadState("ready")
      })
      .catch((error: unknown) => {
        if (generation !== loadGeneration.current) return
        if (error instanceof ApiError && error.status === 401) {
          expireSession()
          return
        }
        setLoadError(
          verified
            ? "We couldn't load responses. Please try again."
            : "We couldn't verify your session. Please try again."
        )
        setLoadState("error")
      })
  }, [expireSession])

  useEffect(() => {
    void loadResponses()
    return () => {
      loadGeneration.current += 1
    }
  }, [loadResponses])

  function refresh() {
    setRecords([])
    setLoadError(null)
    setActionError(null)
    setLoadState("loading")
    void loadResponses()
  }

  async function download() {
    setAction("download")
    setActionError(null)
    const generation = loadGeneration.current
    try {
      const blob = await exportInquiries()
      if (generation !== loadGeneration.current) return
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = "daisy-gci-event-form-responses.csv"
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      if (generation !== loadGeneration.current) return
      if (error instanceof ApiError && error.status === 401) expireSession()
      else setActionError("We couldn't download the CSV. Please try again.")
    } finally {
      setAction(null)
    }
  }

  async function logout() {
    setAction("logout")
    setActionError(null)
    try {
      await logoutAdmin()
      expireSession()
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) expireSession()
      else setActionError("We couldn't sign you out. Please try again.")
    } finally {
      setAction(null)
    }
  }

  return (
    <AdminLayout
      headerActions={
        <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-3">
          <RouteLink page="form" className={adminLinkClass}>
            Event form
          </RouteLink>
          {session && (
            <Button
              variant="outline"
              className="h-10 px-3"
              onClick={logout}
              disabled={action !== null}
            >
              {action === "logout" ? (
                <Loader2
                  aria-hidden
                  className="animate-spin motion-reduce:animate-none"
                />
              ) : (
                <LogOut aria-hidden />
              )}
              {action === "logout" ? "Signing out…" : "Log out"}
            </Button>
          )}
        </div>
      }
    >
      <main className="mx-auto w-full max-w-[1680px] min-w-0 px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-7 flex min-w-0 flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight">
              Event responses
            </h1>
            <p
              className="mt-2 text-sm text-muted-foreground"
              aria-live="polite"
            >
              {loadState === "ready"
                ? `${records.length} ${records.length === 1 ? "response" : "responses"} · Newest first`
                : "Responses from the GIC Event form"}
            </p>
            {session && (
              <p className="mt-2 text-xs [overflow-wrap:anywhere] text-muted-foreground">
                Signed in as {session.email}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-10 px-3"
              onClick={refresh}
              disabled={loadState === "loading" || action !== null}
            >
              <RefreshCw aria-hidden />
              Refresh
            </Button>
            <Button
              className="h-10 bg-foreground px-3 text-background hover:bg-foreground/90"
              onClick={download}
              disabled={!session || loadState !== "ready" || action !== null}
            >
              {action === "download" ? (
                <Loader2
                  aria-hidden
                  className="animate-spin motion-reduce:animate-none"
                />
              ) : (
                <Download aria-hidden />
              )}
              {action === "download" ? "Downloading…" : "Download CSV"}
            </Button>
          </div>
        </div>

        {actionError && (
          <p role="alert" className="mb-5 text-sm text-destructive">
            {actionError}
          </p>
        )}

        {loadState === "loading" ? (
          <div
            role="status"
            className="flex items-center gap-2 border-t py-12 text-sm text-muted-foreground"
          >
            <Loader2
              aria-hidden
              className="size-4 animate-spin motion-reduce:animate-none"
            />
            Loading responses…
          </div>
        ) : loadState === "error" ? (
          <div className="border-t py-10">
            <p role="alert" className="text-sm text-destructive">
              {loadError}
            </p>
            <Button
              variant="outline"
              className="mt-4 h-10 px-3"
              onClick={refresh}
              disabled={action !== null}
            >
              Try again
            </Button>
          </div>
        ) : records.length === 0 ? (
          <div className="border-t py-12">
            <h2 className="text-lg font-medium">No responses yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              New event form submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="max-w-full min-w-0">
            <p className="mb-3 text-xs text-muted-foreground">
              Scroll the table horizontally to view all fields.
            </p>
            <ResponsesTable records={records} />
          </div>
        )}
      </main>
    </AdminLayout>
  )
}

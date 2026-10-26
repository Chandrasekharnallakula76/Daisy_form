const API_BASE =
  import.meta.env.VITE_API_URL?.trim() || import.meta.env.BASE_URL
const API_URL = `${API_BASE.replace(/\/+$/, "")}/api`

export type InquiryPayload = {
  fullName: string
  companyOrganization: string
  businessEmail: string
  jobTitle?: string
  phoneNumber?: string
  interests: string[]
  interestOther?: string
  preferredFollowUpMethods: string[]
  questionsOrComments?: string
}

export type InquiryRecord = Partial<InquiryPayload> & {
  id: string
  submittedAt: string
}

export type AdminSession = { email: string }

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

async function responseError(response: Response) {
  const body: unknown = await response.json().catch(() => null)
  const messages =
    body && typeof body === "object"
      ? [
          "error" in body ? body.error : null,
          "message" in body ? body.message : null,
        ]
      : []
  const message = messages.find(
    (value): value is string => typeof value === "string" && !!value.trim()
  )
  return new ApiError(
    message ?? `Request failed with status ${response.status}`,
    response.status
  )
}

async function adminRequest(path: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    cache: "no-store",
  })
  if (!response.ok) throw await responseError(response)
  return response
}

export async function loginAdmin(credentials: {
  email: string
  password: string
}): Promise<AdminSession> {
  const response = await adminRequest("/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })
  return response.json()
}

export async function getAdminSession(): Promise<AdminSession> {
  const response = await adminRequest("/admin/session")
  return response.json()
}

export async function logoutAdmin() {
  await adminRequest("/admin/logout", { method: "POST" })
}

export async function getInquiries(): Promise<InquiryRecord[]> {
  const response = await adminRequest("/inquiries")
  const body: { inquiries: InquiryRecord[] } = await response.json()
  return body.inquiries
}

export async function exportInquiries(): Promise<Blob> {
  const response = await adminRequest("/inquiries/export.csv")
  return response.blob()
}

export async function submitInquiry(payload: InquiryPayload) {
  const res = await fetch(`${API_URL}/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw await responseError(res)
  }
  return res.json().catch(() => null)
}

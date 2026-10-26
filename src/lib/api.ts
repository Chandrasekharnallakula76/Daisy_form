const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")

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

export async function submitInquiry(payload: InquiryPayload) {
  const res = await fetch(`${API_URL}/api/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? `Request failed with status ${res.status}`)
  }
  return res.json().catch(() => null)
}

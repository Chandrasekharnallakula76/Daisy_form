const INTEREST_LABELS: Record<string, string> = {
  "product-demo": "Product demonstration",
  "ai-solutions": "Exploring AI solutions",
  "exploring-ai": "Exploring AI solutions",
  "business-partnership": "Business partnership",
  "pricing-info": "Pricing / product information",
  other: "Other",
}

const FOLLOW_UP_LABELS: Record<string, string> = {
  email: "Email",
  phone: "Phone",
}

export function formatValue(value?: string) {
  return value?.trim() ? value : "—"
}

export function formatOptions(
  values: string[] | undefined,
  category: "interests" | "followUp"
) {
  if (!values?.length) return "—"
  const labels = category === "interests" ? INTEREST_LABELS : FOLLOW_UP_LABELS
  return values
    .map((value) => (Object.hasOwn(labels, value) ? labels[value] : value))
    .join(", ")
}

export function formatTimestamp(value?: string) {
  if (!value?.trim()) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

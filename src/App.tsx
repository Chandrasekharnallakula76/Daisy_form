import { useState, type FormEvent } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Monitor,
  Sparkles,
  Tag,
  Users,
} from "lucide-react"

import { DaisyLogo } from "@/components/brand"
import { RouteLink } from "@/components/route-link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { submitInquiry } from "@/lib/api"

const HIGHLIGHTS = [
  {
    icon: Monitor,
    title: "Product demonstrations",
    text: "See Daisy in action",
  },
  {
    icon: Sparkles,
    title: "Explore AI solutions",
    text: "Discover possibilities",
  },
  { icon: Users, title: "Business partnership", text: "Let's grow together" },
  {
    icon: Tag,
    title: "Pricing & product information",
    text: "Get detailed insights",
  },
]

const INTERESTS = [
  { id: "product-demo", label: "Product demonstration" },
  { id: "ai-solutions", label: "Exploring AI solutions" },
  { id: "business-partnership", label: "Business partnership" },
  { id: "pricing-info", label: "Pricing / product information" },
] as const

const FOLLOW_UP = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
] as const

type Interest = (typeof INTERESTS)[number]["id"] | "other"
type FollowUp = (typeof FOLLOW_UP)[number]["id"]

type FormState = {
  fullName: string
  company: string
  email: string
  jobTitle: string
  phone: string
  interests: Interest[]
  otherInterest: string
  followUp: FollowUp[]
  comments: string
  marketing: boolean
}

type Errors = Partial<Record<keyof FormState, string>>

const EMPTY: FormState = {
  fullName: "",
  company: "",
  email: "",
  jobTitle: "",
  phone: "",
  interests: [],
  otherInterest: "",
  followUp: [],
  comments: "",
  marketing: false,
}

function validate(form: FormState): Errors {
  const errors: Errors = {}
  if (!form.fullName.trim()) errors.fullName = "Please enter your full name."
  if (!form.company.trim())
    errors.company = "Please enter your company or organization."
  if (!form.email.trim()) errors.email = "Please enter your business email."
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = "Please enter a valid email address."
  if (form.interests.length === 0)
    errors.interests = "Please select at least one area of interest."
  else if (form.interests.includes("other") && !form.otherInterest.trim())
    errors.otherInterest = "Please tell us what else you're interested in."
  if (form.followUp.includes("phone") && !form.phone.trim())
    errors.phone = "Please add a phone number so we can call you."
  return errors
}

function toggle<T>(list: T[], value: T, checked: boolean) {
  if (checked) return list.includes(value) ? list : [...list, value]
  return list.filter((v) => v !== value)
}

const inputClass = "h-11 rounded-lg bg-background px-3.5 text-[15px]"

const eventBadgeClass =
  "w-fit rounded-full bg-linear-to-r from-cyan-50 to-violet-50 px-3.5 py-1 font-semibold text-blue-700 ring-1 ring-blue-200 dark:from-blue-950/60 dark:to-violet-950/60 dark:text-blue-300 dark:ring-blue-800"

// Bordered, selectable option tiles from tablet up; plain checkbox rows on phones.
const optionCardClass =
  "sm:gap-3 sm:rounded-lg sm:border sm:border-input sm:bg-background sm:pl-4 sm:shadow-xs sm:transition-colors sm:hover:border-emerald-300 sm:has-data-checked:border-emerald-500 sm:has-data-checked:bg-emerald-50/70 sm:has-data-checked:ring-1 sm:has-data-checked:ring-emerald-500/30 dark:sm:has-data-checked:bg-emerald-900/20"

function Optional() {
  return <span className="font-normal text-muted-foreground">(optional)</span>
}

export function App() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = validate(form)
    setErrors(next)
    const firstInvalid = Object.keys(next)[0]
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus()
      return
    }
    const optional = (value: string) => value.trim() || undefined
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitInquiry({
        fullName: form.fullName.trim(),
        companyOrganization: form.company.trim(),
        businessEmail: form.email.trim(),
        jobTitle: optional(form.jobTitle),
        phoneNumber: optional(form.phone),
        interests: form.interests,
        interestOther: form.interests.includes("other")
          ? optional(form.otherInterest)
          : undefined,
        preferredFollowUpMethods: form.followUp,
        questionsOrComments: optional(form.comments),
      })
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message !== "Failed to fetch"
          ? error.message
          : "We couldn't reach the server. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setForm(EMPTY)
    setErrors({})
    setSubmitError(null)
    setSubmitted(false)
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-linear-to-br from-cyan-50/70 via-white to-violet-50/70 dark:from-background dark:via-background dark:to-background">
      {/* Background decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 size-[28rem] rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-900/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 -left-40 size-[26rem] rounded-full bg-violet-100/50 blur-3xl lg:hidden dark:bg-violet-900/20"
      />
      {/* Desktop: illustration sits low under the intro column, fading in from the top; its logo strip is cropped off */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[40%] mask-t-from-65% lg:block dark:opacity-40"
      >
        <div className="absolute bottom-0 -left-[6%] h-[112%]">
          <img
            src={`${import.meta.env.BASE_URL}daisyimage.png`}
            alt=""
            // Full strength under the person and icons, then the waves on the right recede to a soft wash
            className="h-full w-auto max-w-none [mask-image:linear-gradient(to_right,black_45%,rgb(0_0_0/0.3)_62%,rgb(0_0_0/0.18)_90%,transparent)]"
          />
        </div>
      </div>

      <div className="relative mx-auto grid w-full max-w-2xl gap-8 px-5 py-8 sm:px-8 sm:py-12 lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14 lg:px-8 lg:py-12">
        {/* Intro */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-12 lg:self-start">
          {/* Phones: logo and event badge share a header row; tablet up keeps the badge above the heading */}
          <div className="flex items-center justify-between gap-4 border-b border-blue-900/10 pb-5 sm:border-0 sm:pb-0 dark:border-border">
            <DaisyLogo />
            <span
              className={`${eventBadgeClass} inline-flex items-center gap-1.5 text-xs sm:hidden`}
            >
              <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-300" />
              GIC Event
            </span>
          </div>

          <div className="flex flex-col gap-4 lg:mt-10">
            <span className={`${eventBadgeClass} hidden text-sm sm:inline`}>
              GIC Event
            </span>
            <h1 className="text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Let&apos;s Connect!
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Share your details so our team can follow up about your interests
              and explore how Daisy can support your goals.
            </p>
          </div>

          <ul className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-50 to-violet-100 text-blue-600 ring-1 ring-blue-100 dark:from-blue-950/60 dark:to-violet-950/60 dark:text-blue-300 dark:ring-blue-900">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Card only on desktop; phones and tablets show the form directly on the background */}
        <main className="border-t border-blue-900/10 pt-8 lg:rounded-2xl lg:border lg:border-white/80 lg:bg-card/95 lg:p-8 lg:shadow-xl lg:shadow-sky-900/5 lg:backdrop-blur dark:border-border">
          {submitted ? (
            <div className="flex flex-col items-center gap-5 py-12 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                <CheckCircle2 className="size-9" />
              </span>
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  Thank you for connecting with Daisy!
                </h2>
                <p className="max-w-sm text-muted-foreground">
                  We&apos;ve received your details
                  {form.fullName ? `, ${form.fullName.split(" ")[0]}` : ""}. Our
                  team will follow up with you shortly.
                </p>
              </div>
              <Button variant="outline" size="lg" onClick={reset}>
                Submit another response
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-6 flex flex-col gap-1.5">
                <h2 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">
                  GIC Event | Lead Capture Form
                </h2>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Please share your details so our team can follow up about your
                  interests.
                </p>
              </div>

              <FieldGroup className="gap-5">
                <Field data-invalid={!!errors.fullName}>
                  <FieldLabel htmlFor="fullName">Full name *</FieldLabel>
                  <Input
                    id="fullName"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    className={inputClass}
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    aria-invalid={!!errors.fullName}
                  />
                  <FieldError>{errors.fullName}</FieldError>
                </Field>

                <Field data-invalid={!!errors.company}>
                  <FieldLabel htmlFor="company">
                    Company / organization *
                  </FieldLabel>
                  <Input
                    id="company"
                    autoComplete="organization"
                    placeholder="Enter your company or organization"
                    className={inputClass}
                    value={form.company}
                    onChange={(e) => set("company", e.target.value)}
                    aria-invalid={!!errors.company}
                  />
                  <FieldError>{errors.company}</FieldError>
                </Field>

                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">Business email *</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your business email address"
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    aria-invalid={!!errors.email}
                  />
                  <FieldError>{errors.email}</FieldError>
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="jobTitle">
                      Job title <Optional />
                    </FieldLabel>
                    <Input
                      id="jobTitle"
                      autoComplete="organization-title"
                      placeholder="Enter your job title"
                      className={inputClass}
                      value={form.jobTitle}
                      onChange={(e) => set("jobTitle", e.target.value)}
                    />
                  </Field>

                  <Field data-invalid={!!errors.phone}>
                    <FieldLabel htmlFor="phone">
                      Phone number <Optional />
                    </FieldLabel>
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Enter your phone number"
                      className={inputClass}
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      aria-invalid={!!errors.phone}
                    />
                    <FieldError>{errors.phone}</FieldError>
                  </Field>
                </div>

                <FieldSet
                  id="interests"
                  tabIndex={-1}
                  className="gap-3 outline-none"
                  data-invalid={!!errors.interests}
                >
                  <FieldLegend className="mb-1 text-[15px] font-semibold">
                    What are you interested in? *
                  </FieldLegend>
                  <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2">
                    {INTERESTS.map((item) => (
                      <Field
                        key={item.id}
                        orientation="horizontal"
                        className={optionCardClass}
                      >
                        <Checkbox
                          id={`interest-${item.id}`}
                          checked={form.interests.includes(item.id)}
                          onCheckedChange={(checked) =>
                            set(
                              "interests",
                              toggle(form.interests, item.id, checked)
                            )
                          }
                        />
                        <FieldLabel
                          htmlFor={`interest-${item.id}`}
                          className="cursor-pointer text-[15px] font-normal sm:py-3.5"
                        >
                          {item.label}
                        </FieldLabel>
                      </Field>
                    ))}
                    <Field
                      orientation="horizontal"
                      className={`${optionCardClass} flex-wrap sm:col-span-2 sm:flex-nowrap sm:py-1.5 sm:pr-1.5`}
                    >
                      <Checkbox
                        id="interest-other"
                        checked={form.interests.includes("other")}
                        onCheckedChange={(checked) =>
                          set(
                            "interests",
                            toggle(form.interests, "other", checked)
                          )
                        }
                      />
                      <FieldLabel
                        htmlFor="interest-other"
                        className="flex-none! cursor-pointer text-[15px] font-normal"
                      >
                        Other:
                      </FieldLabel>
                      <Input
                        id="otherInterest"
                        placeholder="Please specify"
                        aria-label="Other interest"
                        className={`${inputClass} min-w-0 flex-1 basis-full sm:h-10 sm:basis-auto`}
                        value={form.otherInterest}
                        onChange={(e) => {
                          set("otherInterest", e.target.value)
                          if (e.target.value.trim())
                            set(
                              "interests",
                              toggle(form.interests, "other", true)
                            )
                        }}
                        aria-invalid={!!errors.otherInterest}
                      />
                    </Field>
                  </div>
                  <FieldError>
                    {errors.interests ?? errors.otherInterest}
                  </FieldError>
                </FieldSet>

                <FieldSet className="gap-3">
                  <FieldLegend className="mb-1 text-[15px] font-semibold">
                    Preferred follow-up method
                  </FieldLegend>
                  <div className="flex flex-wrap gap-x-8 gap-y-3">
                    {FOLLOW_UP.map((item) => (
                      <Field
                        key={item.id}
                        orientation="horizontal"
                        className="w-auto"
                      >
                        <Checkbox
                          id={`followUp-${item.id}`}
                          checked={form.followUp.includes(item.id)}
                          onCheckedChange={(checked) =>
                            set(
                              "followUp",
                              toggle(form.followUp, item.id, checked)
                            )
                          }
                        />
                        <FieldLabel
                          htmlFor={`followUp-${item.id}`}
                          className="text-[15px] font-normal"
                        >
                          {item.label}
                        </FieldLabel>
                      </Field>
                    ))}
                  </div>
                </FieldSet>

                <Field>
                  <FieldLabel htmlFor="comments">
                    Questions or comments <Optional />
                  </FieldLabel>
                  <Textarea
                    id="comments"
                    rows={3}
                    placeholder="Share any questions or additional details..."
                    className="min-h-24 rounded-lg bg-background px-3.5 py-3 text-[15px]"
                    value={form.comments}
                    onChange={(e) => set("comments", e.target.value)}
                  />
                </Field>

                {submitError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive"
                  >
                    {submitError}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="group h-12 w-full rounded-xl bg-linear-to-r from-cyan-500 via-blue-600 to-violet-600 text-base font-semibold text-white shadow-lg shadow-blue-600/25 hover:from-cyan-600 hover:via-blue-700 hover:to-violet-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit
                      <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>
          )}
        </main>
      </div>
      <footer className="relative mx-auto w-full max-w-2xl px-5 pb-6 text-sm sm:px-8 lg:max-w-6xl">
        <RouteLink
          page="login"
          className="rounded-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Admin login
        </RouteLink>
      </footer>
    </div>
  )
}

export default App

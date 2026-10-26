import { cn } from "@/lib/utils"

export function DaisyLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-fit rounded-xl bg-transparent px-3 py-2 dark:bg-slate-950",
        className
      )}
    >
      <img
        src={`${import.meta.env.BASE_URL}daisy-logo-light.png`}
        alt="Daisy Intelligence"
        width={2047}
        height={692}
        className="block h-11 w-auto select-none sm:h-12 lg:h-14 dark:hidden"
        draggable={false}
      />
      <img
        src={`${import.meta.env.BASE_URL}daisy-logo-dark.png`}
        alt="Daisy Intelligence"
        width={2047}
        height={692}
        className="hidden h-11 w-auto select-none sm:h-12 lg:h-14 dark:block"
        draggable={false}
      />
    </div>
  )
}

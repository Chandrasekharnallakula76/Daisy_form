import { cn } from "@/lib/utils"

export function DaisyLogo({ className }: { className?: string }) {
  return (
    // The wordmark is black, so it gets a light plate in dark mode to stay legible.
    <div
      className={cn(
        "w-fit dark:rounded-xl dark:bg-white dark:px-3 dark:py-2",
        className
      )}
    >
      <img
        src="/Daisy_new_logo_black.png"
        alt="Daisy Intelligence"
        width={2047}
        height={692}
        className="h-11 w-auto select-none sm:h-12 lg:h-14"
        draggable={false}
      />
    </div>
  )
}

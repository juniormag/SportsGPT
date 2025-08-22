import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div 
        className={cn(
          "animate-spin rounded-full border-2 border-white/20 border-t-white",
          sizeClasses[size]
        )}
      />
    </div>
  )
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in-0 duration-300">
      {children}
    </div>
  )
}

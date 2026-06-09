import Image from "next/image"
import { cn } from "@/lib/utils"

interface UpSkillLogoProps {
  className?: string
  showText?: boolean
}

export function UpSkillLogo({ className, showText = true }: UpSkillLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={`relative overflow-hidden rounded-full shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-6 ${showText ? "h-14 w-14" : "h-16 w-16"}`}>
        <Image
          src="/images/logo.jpeg"
          alt="UpSkill Logo"
          fill
          className="object-cover"
          priority
        />
      </div>
      {showText && (
        <span className="text-2xl font-extrabold tracking-tight text-foreground">
          UpSkill
        </span>
      )}
    </div>
  )
}

import Image from "next/image"
import { cn } from "@/lib/utils"

// Team IDs and their corresponding logo file names
const teamLogoFiles = {
  corinthians: "/logos/clubes/corinthians.svg",
  flamengo: "/logos/clubes/flamengo.svg",
  "sao-paulo": "/logos/clubes/sao-paulo.svg",
  santos: "/logos/clubes/santos.svg",
  palmeiras: "/logos/clubes/palmeiras.svg",
  "atletico-mg": "/logos/clubes/atletico-mg.svg",
  bragantino: "/logos/clubes/bragantino.svg",
  botafogo: "/logos/clubes/botafogo.svg",
  vitoria: "/logos/clubes/vitoria.svg",
  vasco: "/logos/clubes/vasco.svg",
  sport: "/logos/clubes/sport.svg",
  fluminense: "/logos/clubes/fluminense.svg",
  gremio: "/logos/clubes/gremio.svg",
  cruzeiro: "/logos/clubes/cruzeiro.svg",
}

export interface TeamLogoProps {
  teamId: string
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export function TeamLogo({ teamId, isSelected, onClick, className = "" }: TeamLogoProps) {
  const logoSrc = teamLogoFiles[teamId as keyof typeof teamLogoFiles]
  
  if (!logoSrc) {
    return (
      <div className={`w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs ${className}`}>
        ?
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "team-logo-button flex items-center justify-center overflow-clip relative shrink-0",
        isSelected && "selected",
        className
      )}
      title={teamId.charAt(0).toUpperCase() + teamId.slice(1).replace('-', ' ')}
    >
      <div className="h-[var(--team-logo-inner)] relative shrink-0 w-[var(--team-logo-inner)]">
        <Image
          src={logoSrc}
          alt={`Logo ${teamId}`}
          width={35.287}
          height={35.287}
          className="size-full object-contain"
          priority
        />
      </div>
    </button>
  )
}

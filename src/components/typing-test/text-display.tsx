import type React from "react"
import type { CharacterData } from "@/types"

interface TextDisplayProps {
  isLoading: boolean
  parsedText: CharacterData[]
  fontSizeClass: string
  textContainerRef: React.RefObject<HTMLDivElement | null>
}

export function TextDisplay({ isLoading, parsedText, fontSizeClass, textContainerRef }: TextDisplayProps) {
  if (isLoading) {
    return (
      <div className="p-4 bg-muted rounded-md text-lg leading-relaxed flex justify-center items-center h-32">
        Loading AI-generated text...
      </div>
    )
  }

  return (
    <div
      ref={textContainerRef}
      className={`p-4 bg-muted dark:bg-gray-800 rounded-md leading-relaxed max-h-48 overflow-y-auto ${fontSizeClass}`}
    >
      {parsedText.map((charData, index) => {
        let className = "text-muted-foreground"

        if (charData.isCorrect !== undefined) {
          className = charData.isCorrect
            ? "text-green-500 dark:text-green-400 font-medium"
            : "text-red-500 dark:text-red-400 font-medium"
        }

        // Highlight current position
        if (charData.isCurrent) {
          className += " bg-primary/20 px-0.5 animate-pulse current-char"
        }

        return (
          <span key={`char-${index}-${charData.char}`} className={className}>
            {charData.char}
          </span>
        )
      })}
    </div>
  )
}

import { Badge } from "@/components/ui/badge"
import type { WordData } from "@/types"

interface WordAnalysisProps {
  isStarted: boolean
  typedWords: WordData[]
}

export function WordAnalysis({ isStarted, typedWords }: WordAnalysisProps) {
  if (!isStarted || typedWords.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {typedWords.map((word, index) => (
        <Badge
          key={`word-${index}`}
          variant={word.isCorrect ? "default" : word.isPartiallyCorrect ? "outline" : "destructive"}
          className="px-2 py-1"
        >
          {word.text}
          {!word.isCorrect && <span className="ml-1 text-xs">({word.errorCount})</span>}
        </Badge>
      ))}
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface TestControlsProps {
  isStarted: boolean
  isPaused: boolean
  isFinished: boolean
  isLoading: boolean
  startTest: () => void
  pauseTest: () => void
  resumeTest: () => void
  resetTest: () => void
  fetchRandomText: () => void
}

export function TestControls({
  isStarted,
  isPaused,
  isFinished,
  isLoading,
  startTest,
  pauseTest,
  resumeTest,
  resetTest,
  fetchRandomText,
}: TestControlsProps) {
  return (
    <div className="flex justify-center gap-4">
      {!isStarted && !isFinished && (
        <Button onClick={startTest} size="lg" disabled={isLoading}>
          Start Test
        </Button>
      )}

      {isStarted && !isPaused && (
        <Button onClick={pauseTest} variant="outline" size="lg">
          Pause
        </Button>
      )}

      {isStarted && isPaused && (
        <Button onClick={resumeTest} size="lg">
          Resume
        </Button>
      )}

      {(isStarted || isPaused) && (
        <Button variant="outline" onClick={resetTest} size="lg">
          Reset
        </Button>
      )}

      {isFinished && (
        <Button onClick={startTest} size="lg">
          Try Again
        </Button>
      )}

      {isFinished && (
        <Button variant="outline" onClick={resetTest} size="lg">
          <RotateCcw className="mr-2 h-4 w-4" />
          New Test
        </Button>
      )}

      {!isStarted && !isFinished && !isLoading && (
        <Button variant="outline" onClick={fetchRandomText} size="lg">
          <RotateCcw className="mr-2 h-4 w-4" />
          New Text
        </Button>
      )}
    </div>
  )
}

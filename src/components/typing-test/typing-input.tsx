"use client"

import { useContext } from "react"
import { Input } from "@/components/ui/input"
import { TypingTestContext } from "./typing-test-context"

export function TypingInput() {
  const { text, inputRef, isStarted, isPaused, isFinished, isLoading, handleInputChange, handleKeyDown, handleKeyUp } =
    useContext(TypingTestContext)

  return (
    <Input
      ref={inputRef}
      type="text"
      value={text}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      disabled={!isStarted || isPaused || isFinished || isLoading}
      className="w-full p-3 focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
      placeholder={
        isPaused
          ? "Test paused. Press Ctrl+Space to resume"
          : isStarted
            ? "Start typing..."
            : "Click 'Start Test' to begin or press Ctrl+Space"
      }
    />
  )
}

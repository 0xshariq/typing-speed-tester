"use client"

import { useMemo } from "react"
import type { KeyboardLayout } from "@/types"

interface VisualKeyboardProps {
  showKeyboard: boolean
  focusMode: boolean
  keyboardLayout: KeyboardLayout
  currentKey: string | null
  sampleText: string
  textLength: number
}

export function VisualKeyboard({
  showKeyboard,
  focusMode,
  keyboardLayout,
  currentKey,
  sampleText,
  textLength,
}: VisualKeyboardProps) {
  const keyboardLayouts = useMemo(
    () => ({
      qwerty: [
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
        ["z", "x", "c", "v", "b", "n", "m"],
      ],
      dvorak: [
        ["'", ",", ".", "p", "y", "f", "g", "c", "r", "l"],
        ["a", "o", "e", "u", "i", "d", "h", "t", "n", "s"],
        [";", "q", "j", "k", "x", "b", "m", "w", "v", "z"],
      ],
      colemak: [
        ["q", "w", "f", "p", "g", "j", "l", "u", "y", ";"],
        ["a", "r", "s", "t", "d", "h", "n", "e", "i", "o"],
        ["z", "x", "c", "v", "b", "k", "m"],
      ],
    }),
    [],
  )

  if (!showKeyboard || focusMode) {
    return null
  }

  return (
    <div className="hidden md:block">
      <div className="bg-slate-100 dark:bg-gray-800 p-2 rounded-md">
        <div className="flex justify-center mb-1">
          {keyboardLayouts[keyboardLayout][0].map((key) => (
            <div
              key={`key-${key}`}
              className={`w-10 h-10 m-0.5 flex items-center justify-center rounded-md border ${
                currentKey === key
                  ? "bg-primary text-primary-foreground"
                  : sampleText[textLength] === key
                    ? "bg-primary/20"
                    : "bg-white dark:bg-gray-700"
              }`}
            >
              {key.toUpperCase()}
            </div>
          ))}
        </div>
        <div className="flex justify-center mb-1">
          <div className="w-5" /> {/* Offset for second row */}
          {keyboardLayouts[keyboardLayout][1].map((key) => (
            <div
              key={`key-${key}`}
              className={`w-10 h-10 m-0.5 flex items-center justify-center rounded-md border ${
                currentKey === key
                  ? "bg-primary text-primary-foreground"
                  : sampleText[textLength] === key
                    ? "bg-primary/20"
                    : "bg-white dark:bg-gray-700"
              }`}
            >
              {key.toUpperCase()}
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <div className="w-10" /> {/* Offset for third row */}
          {keyboardLayouts[keyboardLayout][2].map((key) => (
            <div
              key={`key-${key}`}
              className={`w-10 h-10 m-0.5 flex items-center justify-center rounded-md border ${
                currentKey === key
                  ? "bg-primary text-primary-foreground"
                  : sampleText[textLength] === key
                    ? "bg-primary/20"
                    : "bg-white dark:bg-gray-700"
              }`}
            >
              {key.toUpperCase()}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-1">
          <div
            className={`w-64 h-10 m-0.5 flex items-center justify-center rounded-md border ${
              currentKey === " "
                ? "bg-primary text-primary-foreground"
                : sampleText[textLength] === " "
                  ? "bg-primary/20"
                  : "bg-white dark:bg-gray-700"
            }`}
          >
            SPACE
          </div>
        </div>
      </div>
    </div>
  )
}

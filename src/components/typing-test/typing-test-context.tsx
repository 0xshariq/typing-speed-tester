"use client"

import type React from "react"

import { createContext } from "react"
import type {
  DifficultyLevel,
  TestResult,
  ThemeMode,
  KeyboardLayout,
  TextType,
  FontSize,
  CharacterData,
  WordData,
} from "@/types"

interface TypingTestContextType {
  // State
  text: string
  sampleText: string
  parsedText: CharacterData[]
  isStarted: boolean
  isPaused: boolean
  isFinished: boolean
  timeLeft: number
  testDuration: number
  wpm: number
  netWpm: number
  cpm: number
  accuracy: number
  errors: number
  errorRate: number
  isLoading: boolean
  difficulty: DifficultyLevel
  testHistory: TestResult[]
  currentKey: string | null
  theme: ThemeMode
  soundEnabled: boolean
  volume: number
  keyboardLayout: KeyboardLayout
  showInstantFeedback: boolean
  personalBest: TestResult | null
  textType: TextType
  wordCount: number
  correctWords: number
  typedWords: WordData[]
  calculationMethod: "traditional" | "actual" | "standard"
  fontSize: FontSize
  showKeyboard: boolean
  focusMode: boolean
  streakCount: number
  maxStreak: number
  showStreakCounter: boolean
  totalKeystrokes: number
  correctKeystrokes: number
  inputRef: React.RefObject<HTMLInputElement>
  textContainerRef: React.RefObject<HTMLDivElement>

  // Actions
  setText: (text: string) => void
  setTestDuration: (duration: number) => void
  setDifficulty: (difficulty: DifficultyLevel) => void
  setTheme: (theme: ThemeMode) => void
  setSoundEnabled: (enabled: boolean) => void
  setVolume: (volume: number) => void
  setKeyboardLayout: (layout: KeyboardLayout) => void
  setShowInstantFeedback: (show: boolean) => void
  setTextType: (type: TextType) => void
  setCalculationMethod: (method: "traditional" | "actual" | "standard") => void
  setFontSize: (size: FontSize) => void
  setShowKeyboard: (show: boolean) => void
  setFocusMode: (enabled: boolean) => void
  setShowStreakCounter: (show: boolean) => void
  startTest: () => void
  pauseTest: () => void
  resumeTest: () => void
  resetTest: () => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  handleKeyUp: () => void
  fetchRandomText: () => Promise<void>
  exportHistory: () => void
  clearHistory: () => void
  shareResult: () => void
  getFontSizeClass: () => string
  getProgressValue: () => number
  formatDate: (date: Date) => string
}

export const TypingTestContext = createContext<TypingTestContextType>({} as TypingTestContextType)

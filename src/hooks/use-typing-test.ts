"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { v4 as uuidv4 } from "uuid"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type {
  TestResult,
  DifficultyLevel,
  ThemeMode,
  KeyboardLayout,
  TextType,
  FontSize,
  CharacterData,
  WordData,
} from "@/types"

export function useTypingTest() {
  const [text, setText] = useState("")
  const [sampleText, setSampleText] = useState("")
  const [parsedText, setParsedText] = useState<CharacterData[]>([])
  const [isStarted, setIsStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [testDuration, setTestDuration] = useLocalStorage<number>("typingTestDuration", 60)
  const [wpm, setWpm] = useState(0)
  const [netWpm, setNetWpm] = useState(0) // Added net WPM
  const [cpm, setCpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [errors, setErrors] = useState(0)
  const [errorRate, setErrorRate] = useState(0) // Added error rate
  const [isLoading, setIsLoading] = useState(false)
  const [difficulty, setDifficulty] = useLocalStorage<DifficultyLevel>("typingTestDifficulty", "medium")
  const [testHistory, setTestHistory] = useLocalStorage<TestResult[]>("typingTestHistory", [])
  const [currentKey, setCurrentKey] = useState<string | null>(null)
  const [theme, setTheme] = useLocalStorage<ThemeMode>("typingTestTheme", "system")
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>("typingTestSoundEnabled", false)
  const [volume, setVolume] = useLocalStorage<number>("typingTestVolume", 50)
  const [keyboardLayout, setKeyboardLayout] = useLocalStorage<KeyboardLayout>("typingTestKeyboardLayout", "qwerty")
  const [showInstantFeedback, setShowInstantFeedback] = useLocalStorage<boolean>("typingTestShowInstantFeedback", true)
  const [personalBest, setPersonalBest] = useState<TestResult | null>(null)
  const [textType, setTextType] = useLocalStorage<TextType>("typingTestTextType", "paragraphs")
  const [errorSound, setErrorSound] = useState<HTMLAudioElement | null>(null)
  const [successSound, setSuccessSound] = useState<HTMLAudioElement | null>(null)
  const [finishSound, setFinishSound] = useState<HTMLAudioElement | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [correctWords, setCorrectWords] = useState(0)
  const [typedWords, setTypedWords] = useState<WordData[]>([])
  const [calculationMethod, setCalculationMethod] = useLocalStorage<"traditional" | "actual" | "standard">(
    "typingTestCalculationMethod",
    "standard", // Changed default to standard
  )
  const [fontSize, setFontSize] = useLocalStorage<FontSize>("typingTestFontSize", "medium")
  const [showKeyboard, setShowKeyboard] = useLocalStorage<boolean>("typingTestShowKeyboard", true)
  const [focusMode, setFocusMode] = useLocalStorage<boolean>("typingTestFocusMode", false)
  const [streakCount, setStreakCount] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [showStreakCounter, setShowStreakCounter] = useLocalStorage<boolean>("typingTestShowStreakCounter", true)
  const [totalKeystrokes, setTotalKeystrokes] = useState(0) // Added total keystrokes
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0) // Added correct keystrokes
  const inputRef = useRef<HTMLInputElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)
  const startTimeRef = useRef<number | null>(null)

  // Initialize audio elements
  useEffect(() => {
    setErrorSound(new Audio("/error.mp3"))
    setSuccessSound(new Audio("/success.mp3"))
    setFinishSound(new Audio("/finish.mp3"))

    // Find personal best from history
    if (testHistory.length > 0) {
      const best = testHistory.reduce((prev: TestResult, current: TestResult) =>
        prev.wpm > current.wpm ? prev : current,
      )
      setPersonalBest(best)
    }

    // Apply theme
    applyTheme(theme)
  }, [testHistory, theme])

  // Apply theme effect
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Update sound volumes
  useEffect(() => {
    if (errorSound) errorSound.volume = volume / 100
    if (successSound) successSound.volume = volume / 100
    if (finishSound) finishSound.volume = volume / 100
  }, [volume, errorSound, successSound, finishSound])

  const applyTheme = (themeMode: ThemeMode) => {
    if (typeof window === "undefined") return

    const root = document.documentElement
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    const effectiveTheme = themeMode === "system" ? systemTheme : themeMode

    if (effectiveTheme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }

  // Count words in a text
  const countWords = useCallback((text: string): number => {
    return text.split(/\s+/).filter((word) => word.length > 0).length
  }, [])

  // Fetch text using AI
  const fetchRandomText = useCallback(async () => {
    setIsLoading(true)
    try {
      // Determine word count based on difficulty
      let wordCount = 50 // default for medium
      switch (difficulty) {
        case "easy":
          wordCount = 20
          break
        case "medium":
          wordCount = 50
          break
        case "hard":
          wordCount = 100
          break
        case "expert":
          wordCount = 150
          break
      }

      // Make request to AI text generation endpoint
      const response = await fetch("/api/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          difficulty,
          type: textType,
          wordCount,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate text")
      }

      const data = await response.json()
      const generatedText = data.content

      // Set the sample text
      setSampleText(generatedText)

      // Count words in the sample text
      setWordCount(countWords(generatedText))

      // Parse the text into character data
      const parsedChars: CharacterData[] = generatedText.split("").map((char: string): CharacterData => ({ char }))
      setParsedText(parsedChars)
    } catch (error) {
      console.error("Failed to fetch text:", error)
      // Fallback to a default text if AI generation fails
      const fallbackText =
        "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once."
      setSampleText(fallbackText)
      setParsedText(fallbackText.split("").map((char) => ({ char })))
      setWordCount(countWords(fallbackText))
    } finally {
      setIsLoading(false)
    }
  }, [difficulty, textType, countWords])

  useEffect(() => {
    fetchRandomText()
  }, [fetchRandomText])

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isStarted && !isPaused && timeLeft > 0) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now()
      }

      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
        calculateStats()
      }, 1000)
    } else if (timeLeft === 0) {
      finishTest()
    }

    return () => clearInterval(timer)
  }, [isStarted, isPaused, timeLeft])

  // Scroll to current position in text
  useEffect(() => {
    if (isStarted && textContainerRef.current && text.length > 0) {
      const currentCharElement = textContainerRef.current.querySelector(".current-char")
      if (currentCharElement) {
        currentCharElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }, [isStarted, text])

  const startTest = () => {
    setText("")
    setIsStarted(true)
    setIsPaused(false)
    setIsFinished(false)
    setTimeLeft(testDuration)
    setWpm(0)
    setNetWpm(0)
    setCpm(0)
    setAccuracy(100)
    setErrors(0)
    setErrorRate(0)
    setTypedWords([])
    setCorrectWords(0)
    setStreakCount(0)
    setMaxStreak(0)
    setTotalKeystrokes(0)
    setCorrectKeystrokes(0)
    startTimeRef.current = null

    // Reset parsed text
    setParsedText(sampleText.split("").map((char) => ({ char })))

    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const pauseTest = () => {
    setIsPaused(true)
  }

  const resumeTest = () => {
    setIsPaused(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const resetTest = () => {
    setText("")
    setIsStarted(false)
    setIsPaused(false)
    setIsFinished(false)
    setTimeLeft(testDuration)
    setWpm(0)
    setNetWpm(0)
    setCpm(0)
    setAccuracy(100)
    setErrors(0)
    setErrorRate(0)
    setTypedWords([])
    setCorrectWords(0)
    setStreakCount(0)
    setMaxStreak(0)
    setTotalKeystrokes(0)
    setCorrectKeystrokes(0)
    startTimeRef.current = null
    fetchRandomText()
  }

  const finishTest = () => {
    setIsFinished(true)
    setIsStarted(false)
    setIsPaused(false)

    // Play finish sound
    if (soundEnabled && finishSound) {
      finishSound.play().catch((e) => console.error("Error playing sound:", e))
    }

    // Calculate final stats
    calculateStats()

    // Save test result to history
    const newResult: TestResult = {
      id: uuidv4(),
      wpm,
      netWpm,
      cpm,
      accuracy,
      errors,
      errorRate,
      time: testDuration - timeLeft,
      date: new Date(),
      difficulty,
      textLength: sampleText.length,
      wordCount,
      correctWords,
      totalKeystrokes,
      correctKeystrokes,
    }

    setTestHistory((prev) => [newResult, ...prev].slice(0, 20)) // Keep only last 20 tests

    // Update personal best
    if (!personalBest || newResult.wpm > personalBest.wpm) {
      setPersonalBest(newResult)
    }
  }

  // Analyze typed words
  const analyzeTypedWords = useCallback((inputValue: string, sampleText: string) => {
    // Split both texts into words
    const sampleWords = sampleText.split(/\s+/)
    const inputWords = inputValue.split(/\s+/)

    const analyzedWords: WordData[] = []
    let correctWordCount = 0
    let totalErrorCount = 0

    // Compare each word
    for (let i = 0; i < inputWords.length; i++) {
      if (i >= sampleWords.length) break

      const inputWord = inputWords[i]
      const sampleWord = sampleWords[i]

      const isCorrect = inputWord === sampleWord
      let errorCount = 0

      // Count character errors in the word
      for (let j = 0; j < Math.max(inputWord.length, sampleWord.length); j++) {
        if (j >= inputWord.length || j >= sampleWord.length || inputWord[j] !== sampleWord[j]) {
          errorCount++
        }
      }

      if (isCorrect) {
        correctWordCount++
      }

      totalErrorCount += errorCount

      analyzedWords.push({
        text: inputWord,
        isCorrect,
        isPartiallyCorrect: !isCorrect && errorCount < sampleWord.length,
        errorCount,
      })
    }

    return {
      words: analyzedWords,
      correctWordCount,
      totalErrorCount,
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setText(inputValue)

    // Start tracking time on first keystroke
    if (isStarted && !startTimeRef.current) {
      startTimeRef.current = Date.now()
    }

    // Calculate errors and track error positions
    let errorCount = 0
    const updatedParsedText = [...parsedText]
    let currentStreak = streakCount
    const newTotalKeystrokes = totalKeystrokes + 1
    let newCorrectKeystrokes = correctKeystrokes

    // Analyze character-by-character errors
    for (let i = 0; i < inputValue.length; i++) {
      if (i < sampleText.length) {
        const isCorrect = inputValue[i] === sampleText[i]
        updatedParsedText[i] = {
          ...updatedParsedText[i],
          isCorrect,
        }

        if (!isCorrect) {
          errorCount++
          currentStreak = 0 // Reset streak on error

          // Play error sound
          if (soundEnabled && errorSound && showInstantFeedback) {
            errorSound.currentTime = 0
            errorSound.play().catch((e) => console.error("Error playing sound:", e))
          }
        } else {
          // Increment streak for correct character
          if (i === inputValue.length - 1) {
            // Only for the last character typed
            currentStreak++
            newCorrectKeystrokes++
            setMaxStreak(Math.max(maxStreak, currentStreak))

            // Play success sound for the last character typed if it's correct
            if (soundEnabled && successSound && showInstantFeedback) {
              successSound.currentTime = 0
              successSound.play().catch((e) => console.error("Error playing sound:", e))
            }
          }
        }
      }
    }

    setStreakCount(currentStreak)
    setTotalKeystrokes(newTotalKeystrokes)
    setCorrectKeystrokes(newCorrectKeystrokes)

    // Clear current character marker from all characters
    for (const char of updatedParsedText) {
      char.isCurrent = false
    }

    // Mark current character
    if (inputValue.length < sampleText.length) {
      updatedParsedText[inputValue.length] = {
        ...updatedParsedText[inputValue.length],
        isCurrent: true,
      }
    }

    // Analyze words
    const { words, correctWordCount, totalErrorCount } = analyzeTypedWords(inputValue, sampleText)
    setTypedWords(words)
    setCorrectWords(correctWordCount)

    // Use word-based error count if using actual calculation method
    if (calculationMethod === "actual" || calculationMethod === "standard") {
      errorCount = totalErrorCount
    }

    setParsedText(updatedParsedText)
    setErrors(errorCount)

    // Calculate error rate (errors per minute)
    const elapsedMinutes = getElapsedMinutes()
    if (elapsedMinutes > 0) {
      setErrorRate(Math.round(errorCount / elapsedMinutes))
    }

    // Calculate accuracy
    calculateAccuracy(inputValue, errorCount, words, correctWordCount)

    // Calculate stats
    calculateStats()

    // Check if test is complete
    if (inputValue.length === sampleText.length) {
      finishTest()
    }
  }

  const calculateAccuracy = (inputValue: string, errorCount: number, words: WordData[], correctWordCount: number) => {
    let accuracyValue = 100

    if (calculationMethod === "traditional") {
      // Traditional: character-based accuracy
      accuracyValue = inputValue.length > 0 ? Math.max(0, 100 - (errorCount / inputValue.length) * 100) : 100
    } else if (calculationMethod === "actual") {
      // Actual: word-based accuracy
      const typedWordCount = words.length
      accuracyValue = typedWordCount > 0 ? Math.max(0, 100 * (correctWordCount / typedWordCount)) : 100
    } else {
      // Standard: correct keystrokes / total keystrokes
      accuracyValue = totalKeystrokes > 0 ? Math.max(0, 100 * (correctKeystrokes / totalKeystrokes)) : 100
    }

    setAccuracy(Math.round(accuracyValue))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setCurrentKey(e.key)

    // Keyboard shortcuts
    if (e.key === "Escape") {
      resetTest()
    } else if (e.key === " " && e.ctrlKey) {
      e.preventDefault()
      if (isStarted) {
        if (isPaused) {
          resumeTest()
        } else {
          pauseTest()
        }
      } else {
        startTest()
      }
    }
  }

  const handleKeyUp = () => {
    setCurrentKey(null)
  }

  const getElapsedMinutes = () => {
    if (!startTimeRef.current) return 0
    const elapsedMs = Date.now() - startTimeRef.current
    return elapsedMs / 60000 // Convert to minutes
  }

  const calculateStats = () => {
    // Use elapsed time for more accurate calculations
    const elapsedMinutes = getElapsedMinutes()

    if (elapsedMinutes <= 0) {
      setWpm(0)
      setNetWpm(0)
      setCpm(0)
      return
    }

    if (calculationMethod === "traditional") {
      // Traditional WPM calculation (characters / 5 / minutes)
      const words = text.length / 5
      const calculatedWpm = Math.round(words / elapsedMinutes)
      setWpm(calculatedWpm)

      // Net WPM = Gross WPM - (Errors / Minutes)
      const calculatedNetWpm = Math.max(0, calculatedWpm - Math.round(errors / elapsedMinutes))
      setNetWpm(calculatedNetWpm)

      // Traditional CPM calculation
      const calculatedCpm = Math.round(text.length / elapsedMinutes)
      setCpm(calculatedCpm)
    } else if (calculationMethod === "actual") {
      // Actual word-based WPM calculation
      const actualWordCount = typedWords.length
      const calculatedWpm = Math.round(actualWordCount / elapsedMinutes)
      setWpm(calculatedWpm)

      // Net WPM = Gross WPM - (Errors / Minutes)
      const calculatedNetWpm = Math.max(
        0,
        calculatedWpm - Math.round((typedWords.length - correctWords) / elapsedMinutes),
      )
      setNetWpm(calculatedNetWpm)

      // Actual CPM calculation
      const calculatedCpm = Math.round(text.length / elapsedMinutes)
      setCpm(calculatedCpm)
    } else {
      // Standard calculation (most accurate)
      // WPM = (All typed entries / 5) / minutes
      const allEntries = text.length
      const calculatedWpm = Math.round(allEntries / 5 / elapsedMinutes)
      setWpm(calculatedWpm)

      // Net WPM = ((All typed entries / 5) - Errors) / minutes
      const calculatedNetWpm = Math.max(0, Math.round((allEntries / 5 - errors) / elapsedMinutes))
      setNetWpm(calculatedNetWpm)

      // CPM = Characters per minute
      const calculatedCpm = Math.round(text.length / elapsedMinutes)
      setCpm(calculatedCpm)
    }
  }

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "small":
        return "text-sm"
      case "medium":
        return "text-lg"
      case "large":
        return "text-xl"
      default:
        return "text-lg"
    }
  }

  const getProgressValue = () => {
    return isStarted ? ((testDuration - timeLeft) / testDuration) * 100 : 0
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date instanceof Date ? date : new Date(date))
  }

  const exportHistory = () => {
    const dataStr = JSON.stringify(testHistory, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `typing-test-history-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your typing test history?")) {
      setTestHistory([])
      setPersonalBest(null)
    }
  }

  const shareResult = () => {
    if (!isFinished) return

    const shareText = `I just typed ${wpm} WPM (${netWpm} Net WPM) with ${accuracy}% accuracy on the Typing Speed Tester! Can you beat my score?`

    if (navigator.share) {
      navigator
        .share({
          title: "My Typing Test Result",
          text: shareText,
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Error sharing:", err)
          // Fallback to clipboard
          copyToClipboard(shareText)
        })
    } else {
      // Fallback to clipboard
      copyToClipboard(shareText)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Result copied to clipboard!"))
      .catch((err) => console.error("Failed to copy:", err))
  }

  return {
    // State
    text,
    sampleText,
    parsedText,
    isStarted,
    isPaused,
    isFinished,
    timeLeft,
    testDuration,
    wpm,
    netWpm,
    cpm,
    accuracy,
    errors,
    errorRate,
    isLoading,
    difficulty,
    testHistory,
    currentKey,
    theme,
    soundEnabled,
    volume,
    keyboardLayout,
    showInstantFeedback,
    personalBest,
    textType,
    wordCount,
    correctWords,
    typedWords,
    calculationMethod,
    fontSize,
    showKeyboard,
    focusMode,
    streakCount,
    maxStreak,
    showStreakCounter,
    totalKeystrokes,
    correctKeystrokes,
    inputRef,
    textContainerRef,

    // Actions
    setText,
    setTestDuration,
    setDifficulty,
    setTheme,
    setSoundEnabled,
    setVolume,
    setKeyboardLayout,
    setShowInstantFeedback,
    setTextType,
    setCalculationMethod,
    setFontSize,
    setShowKeyboard,
    setFocusMode,
    setShowStreakCounter,
    startTest,
    pauseTest,
    resumeTest,
    resetTest,
    handleInputChange,
    handleKeyDown,
    handleKeyUp,
    fetchRandomText,
    exportHistory,
    clearHistory,
    shareResult,
    getFontSizeClass,
    getProgressValue,
    formatDate,
  }
}

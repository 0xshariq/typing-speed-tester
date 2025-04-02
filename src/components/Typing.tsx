"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  RotateCcw,
  Trophy,
  BarChart3,
  History,
  Settings,
  Share2,
  Download,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Info,
  Zap,
  Award,
  KeyboardIcon,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { v4 as uuidv4 } from "uuid"

type TestResult = {
  id: string
  wpm: number
  cpm: number
  accuracy: number
  errors: number
  time: number
  date: Date
  difficulty: DifficultyLevel
  textLength: number
  wordCount: number
  correctWords: number
}

type DifficultyLevel = "easy" | "medium" | "hard" | "expert"
type ThemeMode = "light" | "dark" | "system"
type KeyboardLayout = "qwerty" | "dvorak" | "colemak"
type TextType = "paragraphs" | "quotes"
type FontSize = "small" | "medium" | "large"

interface CharacterData {
  char: string
  isCorrect?: boolean
  isCurrent?: boolean
}

interface WordData {
  text: string
  isCorrect: boolean
  isPartiallyCorrect: boolean
  errorCount: number
}

export default function TypingSpeedTester() {
  const [text, setText] = useState("")
  const [sampleText, setSampleText] = useState("")
  const [parsedText, setParsedText] = useState<CharacterData[]>([])
  const [isStarted, setIsStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [testDuration, setTestDuration] = useState(60)
  const [wpm, setWpm] = useState(0)
  const [cpm, setCpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [errors, setErrors] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium")
  const [testHistory, setTestHistory] = useState<TestResult[]>([])
  const [currentKey, setCurrentKey] = useState<string | null>(null)
  const [theme, setTheme] = useState<ThemeMode>("system")
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [volume, setVolume] = useState(50)
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>("qwerty")
  const [showInstantFeedback, setShowInstantFeedback] = useState(true)
  const [personalBest, setPersonalBest] = useState<TestResult | null>(null)
  const [textType, setTextType] = useState<TextType>("paragraphs")
  const [errorSound, setErrorSound] = useState<HTMLAudioElement | null>(null)
  const [successSound, setSuccessSound] = useState<HTMLAudioElement | null>(null)
  const [finishSound, setFinishSound] = useState<HTMLAudioElement | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [correctWords, setCorrectWords] = useState(0)
  const [typedWords, setTypedWords] = useState<WordData[]>([])
  const [calculationMethod, setCalculationMethod] = useState<"traditional" | "actual">("actual")
  const [fontSize, setFontSize] = useState<FontSize>("medium")
  const [showKeyboard, setShowKeyboard] = useState(true)
  const [focusMode, setFocusMode] = useState(false)
  const [streakCount, setStreakCount] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [showStreakCounter, setShowStreakCounter] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)

  // Initialize audio elements
  useEffect(() => {
    setErrorSound(new Audio("/error.mp3"))
    setSuccessSound(new Audio("/success.mp3"))
    setFinishSound(new Audio("/finish.mp3"))

    // Load test history from localStorage
    const savedHistory = localStorage.getItem("typingTestHistory")
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory)
        setTestHistory(parsedHistory)

        // Find personal best
        if (parsedHistory.length > 0) {
          const best = parsedHistory.reduce((prev: TestResult, current: TestResult) =>
            prev.wpm > current.wpm ? prev : current,
          )
          setPersonalBest(best)
        }
      } catch (e) {
        console.error("Failed to parse saved history:", e)
      }
    }

    // Apply theme
    const savedTheme = localStorage.getItem("typingTestTheme") as ThemeMode | null
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    }

    // Apply sound settings
    const savedSoundEnabled = localStorage.getItem("typingTestSoundEnabled")
    if (savedSoundEnabled !== null) {
      setSoundEnabled(savedSoundEnabled === "true")
    }

    const savedVolume = localStorage.getItem("typingTestVolume")
    if (savedVolume !== null) {
      setVolume(Number.parseInt(savedVolume))
    }

    // Load calculation method preference
    const savedMethod = localStorage.getItem("typingTestCalculationMethod") as "traditional" | "actual" | null
    if (savedMethod) {
      setCalculationMethod(savedMethod)
    }

    // Load font size preference
    const savedFontSize = localStorage.getItem("typingTestFontSize") as FontSize | null
    if (savedFontSize) {
      setFontSize(savedFontSize)
    }

    // Load keyboard visibility preference
    const savedShowKeyboard = localStorage.getItem("typingTestShowKeyboard")
    if (savedShowKeyboard !== null) {
      setShowKeyboard(savedShowKeyboard === "true")
    }

    // Load focus mode preference
    const savedFocusMode = localStorage.getItem("typingTestFocusMode")
    if (savedFocusMode !== null) {
      setFocusMode(savedFocusMode === "true")
    }

    // Load streak counter preference
    const savedShowStreakCounter = localStorage.getItem("typingTestShowStreakCounter")
    if (savedShowStreakCounter !== null) {
      setShowStreakCounter(savedShowStreakCounter === "true")
    }
  }, [])

  // Apply theme effect
  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem("typingTestTheme", theme)
  }, [theme])

  // Save sound settings
  useEffect(() => {
    localStorage.setItem("typingTestSoundEnabled", soundEnabled.toString())
    localStorage.setItem("typingTestVolume", volume.toString())

    // Update volume for all sounds
    if (errorSound) errorSound.volume = volume / 100
    if (successSound) successSound.volume = volume / 100
    if (finishSound) finishSound.volume = volume / 100
  }, [soundEnabled, volume, errorSound, successSound, finishSound])

  // Save calculation method preference
  useEffect(() => {
    localStorage.setItem("typingTestCalculationMethod", calculationMethod)
  }, [calculationMethod])

  // Save font size preference
  useEffect(() => {
    localStorage.setItem("typingTestFontSize", fontSize)
  }, [fontSize])

  // Save keyboard visibility preference
  useEffect(() => {
    localStorage.setItem("typingTestShowKeyboard", showKeyboard.toString())
  }, [showKeyboard])

  // Save focus mode preference
  useEffect(() => {
    localStorage.setItem("typingTestFocusMode", focusMode.toString())
  }, [focusMode])

  // Save streak counter preference
  useEffect(() => {
    localStorage.setItem("typingTestShowStreakCounter", showStreakCounter.toString())
  }, [showStreakCounter])

  // Save test history to localStorage
  useEffect(() => {
    if (testHistory.length > 0) {
      localStorage.setItem("typingTestHistory", JSON.stringify(testHistory))
    }
  }, [testHistory])

  const applyTheme = (themeMode: ThemeMode) => {
    const root = document.documentElement
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    const effectiveTheme = themeMode === "system" ? systemTheme : themeMode

    if (effectiveTheme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }

  // Keyboard layouts
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

  // Count words in a text
  const countWords = useCallback((text: string): number => {
    // Split by spaces and filter out empty strings
    return text.split(/\s+/).filter((word) => word.length > 0).length
  }, [])

  // Fetch text using AI only
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
    setCpm(0)
    setAccuracy(100)
    setErrors(0)
    setTypedWords([])
    setCorrectWords(0)
    setStreakCount(0)
    setMaxStreak(0)

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
    setCpm(0)
    setAccuracy(100)
    setErrors(0)
    setTypedWords([])
    setCorrectWords(0)
    setStreakCount(0)
    setMaxStreak(0)
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

    // Save test result to history
    const newResult: TestResult = {
      id: uuidv4(),
      wpm,
      cpm,
      accuracy,
      errors,
      time: testDuration - timeLeft,
      date: new Date(),
      difficulty,
      textLength: sampleText.length,
      wordCount,
      correctWords,
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
      for (let j = 0; j < inputWord.length; j++) {
        if (j >= sampleWord.length || inputWord[j] !== sampleWord[j]) {
          errorCount++
        }
      }

      // Add errors for missing characters
      if (inputWord.length < sampleWord.length) {
        errorCount += sampleWord.length - inputWord.length
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

    // Calculate errors and track error positions
    let errorCount = 0
    const newErrorPositions: number[] = []
    const updatedParsedText = [...parsedText]
    let currentStreak = streakCount

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
          newErrorPositions.push(i)
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
    if (calculationMethod === "actual") {
      errorCount = totalErrorCount
    }

    setParsedText(updatedParsedText)
    setErrors(errorCount)

    // Calculate accuracy
    let accuracyValue = 100
    if (calculationMethod === "traditional") {
      // Traditional: character-based accuracy
      accuracyValue = inputValue.length > 0 ? Math.max(0, 100 - (errorCount / inputValue.length) * 100) : 100
    } else {
      // Actual: word-based accuracy
      const typedWordCount = words.length
      accuracyValue = typedWordCount > 0 ? Math.max(0, 100 * (correctWordCount / typedWordCount)) : 100
    }

    setAccuracy(Math.round(accuracyValue))

    // Calculate stats
    calculateStats()

    // Check if test is complete
    if (inputValue.length === sampleText.length) {
      finishTest()
    }
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

  const calculateStats = () => {
    const minutes = (testDuration - timeLeft) / 60

    if (minutes <= 0) {
      setWpm(0)
      setCpm(0)
      return
    }

    if (calculationMethod === "traditional") {
      // Traditional WPM calculation (characters / 5 / minutes)
      const words = text.length / 5
      const calculatedWpm = Math.round(words / minutes)
      setWpm(calculatedWpm)

      // Traditional CPM calculation
      const calculatedCpm = Math.round(text.length / minutes)
      setCpm(calculatedCpm)
    } else {
      // Actual word-based WPM calculation
      const actualWordCount = typedWords.length
      const calculatedWpm = Math.round(actualWordCount / minutes)
      setWpm(calculatedWpm)

      // Actual CPM calculation
      const calculatedCpm = Math.round(text.length / minutes)
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

  const renderSampleText = () => {
    return (
      <div ref={textContainerRef} className={`text-wrap break-all ${getFontSizeClass()}`}>
        {parsedText.map((charData, index) => {
          let className = "text-muted-foreground"

          if (index < text.length) {
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

  const getProgressValue = () => {
    return isStarted ? ((testDuration - timeLeft) / testDuration) * 100 : 0
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
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
      localStorage.removeItem("typingTestHistory")
    }
  }

  const shareResult = () => {
    if (!isFinished) return

    const shareText = `I just typed ${wpm} WPM with ${accuracy}% accuracy on the Typing Speed Tester! Can you beat my score?`

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

  return (
    <div className="container max-w-4xl py-10 px-4">
      <Card className={`dark:bg-gray-900 dark:text-gray-100 ${focusMode ? "focus-mode" : ""}`}>
        <CardHeader className={`text-center ${focusMode ? "pb-2" : ""}`}>
          {!focusMode && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {personalBest && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-sm">
                          <Trophy className="h-3 w-3 mr-1 text-yellow-500" />
                          Best: {personalBest.wpm} WPM
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Your personal best</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle theme</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Settings</DialogTitle>
                      <DialogDescription>Customize your typing test experience</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="calculation-method" className="text-right">
                          WPM Calculation
                        </Label>
                        <div className="col-span-3">
                          <Select
                            value={calculationMethod}
                            onValueChange={(value) => setCalculationMethod(value as "traditional" | "actual")}
                          >
                            <SelectTrigger id="calculation-method">
                              <SelectValue placeholder="Calculation method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="actual">Actual Words</SelectItem>
                              <SelectItem value="traditional">Traditional (chars/5)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="duration" className="text-right">
                          Duration
                        </Label>
                        <div className="col-span-3">
                          <Select
                            value={testDuration.toString()}
                            onValueChange={(value) => setTestDuration(Number.parseInt(value))}
                          >
                            <SelectTrigger id="duration">
                              <SelectValue placeholder="Test duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 seconds</SelectItem>
                              <SelectItem value="30">30 seconds</SelectItem>
                              <SelectItem value="60">1 minute</SelectItem>
                              <SelectItem value="120">2 minutes</SelectItem>
                              <SelectItem value="300">5 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="text-type" className="text-right">
                          Text Type
                        </Label>
                        <div className="col-span-3">
                          <Select
                            value={textType}
                            onValueChange={(value) => setTextType(value as TextType)}
                            disabled={isStarted}
                          >
                            <SelectTrigger id="text-type">
                              <SelectValue placeholder="Text type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paragraphs">Paragraphs</SelectItem>
                              <SelectItem value="quotes">Quotes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="font-size" className="text-right">
                          Font Size
                        </Label>
                        <div className="col-span-3">
                          <Select value={fontSize} onValueChange={(value) => setFontSize(value as FontSize)}>
                            <SelectTrigger id="font-size">
                              <SelectValue placeholder="Font size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="keyboard" className="text-right">
                          Keyboard
                        </Label>
                        <div className="col-span-3">
                          <Select
                            value={keyboardLayout}
                            onValueChange={(value) => setKeyboardLayout(value as KeyboardLayout)}
                          >
                            <SelectTrigger id="keyboard">
                              <SelectValue placeholder="Keyboard layout" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="qwerty">QWERTY</SelectItem>
                              <SelectItem value="dvorak">Dvorak</SelectItem>
                              <SelectItem value="colemak">Colemak</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="show-keyboard" className="text-right">
                          Show Keyboard
                        </Label>
                        <div className="flex items-center space-x-2 col-span-3">
                          <Switch id="show-keyboard" checked={showKeyboard} onCheckedChange={setShowKeyboard} />
                          <Label htmlFor="show-keyboard">
                            <KeyboardIcon className="h-4 w-4 ml-2" />
                          </Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="focus-mode" className="text-right">
                          Focus Mode
                        </Label>
                        <div className="flex items-center space-x-2 col-span-3">
                          <Switch id="focus-mode" checked={focusMode} onCheckedChange={setFocusMode} />
                          <Label htmlFor="focus-mode">Hide distractions</Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="streak-counter" className="text-right">
                          Streak Counter
                        </Label>
                        <div className="flex items-center space-x-2 col-span-3">
                          <Switch
                            id="streak-counter"
                            checked={showStreakCounter}
                            onCheckedChange={setShowStreakCounter}
                          />
                          <Label htmlFor="streak-counter">Show streak counter</Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sound-toggle" className="text-right">
                          Sound
                        </Label>
                        <div className="flex items-center space-x-2 col-span-3">
                          <Switch id="sound-toggle" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                          <Label htmlFor="sound-toggle">
                            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                          </Label>
                        </div>
                      </div>

                      {soundEnabled && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="volume" className="text-right">
                            Volume
                          </Label>
                          <div className="col-span-3">
                            <Slider
                              id="volume"
                              min={0}
                              max={100}
                              step={1}
                              value={[volume]}
                              onValueChange={(value) => setVolume(value[0])}
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="feedback-toggle" className="text-right">
                          Instant Feedback
                        </Label>
                        <div className="flex items-center space-x-2 col-span-3">
                          <Switch
                            id="feedback-toggle"
                            checked={showInstantFeedback}
                            onCheckedChange={setShowInstantFeedback}
                          />
                          <Label htmlFor="feedback-toggle">Show real-time feedback</Label>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <BarChart3 className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Statistics</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={exportHistory}>
                      <Download className="mr-2 h-4 w-4" />
                      Export History
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={clearHistory}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Clear History
                    </DropdownMenuItem>
                    {isFinished && (
                      <DropdownMenuItem onClick={shareResult}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Result
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

          {!focusMode && (
            <>
              <CardTitle className="text-3xl mt-2">Typing Speed Test</CardTitle>
              <CardDescription>Test your typing speed and accuracy with AI-generated texts</CardDescription>

              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <Select
                  value={difficulty}
                  onValueChange={(value) => setDifficulty(value as DifficultyLevel)}
                  disabled={isStarted}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={textType} onValueChange={(value) => setTextType(value as TextType)} disabled={isStarted}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Text type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paragraphs">Paragraphs</SelectItem>
                    <SelectItem value="quotes">Quotes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-xl font-medium">{timeLeft}s</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {showStreakCounter && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-sm">
                        <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                        Streak: {streakCount}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Current streak of correct characters</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {showStreakCounter && maxStreak > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-sm">
                        <Award className="h-3 w-3 mr-1 text-purple-500" />
                        Max: {maxStreak}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Maximum streak this session</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-sm">
                      WPM: {wpm}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{calculationMethod === "actual" ? "Actual words per minute" : "Characters/5 per minute"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-sm">
                      CPM: {cpm}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Characters Per Minute</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-sm">
                      Accuracy: {accuracy}%
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {calculationMethod === "actual"
                        ? "Percentage of correct words"
                        : "Percentage of correct keystrokes"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-sm">
                      Errors: {errors}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{calculationMethod === "actual" ? "Number of word errors" : "Number of character errors"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      {calculationMethod === "actual"
                        ? "Using actual word count: Words are counted when you type a space"
                        : "Using traditional calculation: 5 characters = 1 word"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <Progress value={getProgressValue()} className="h-2" />

          {isLoading ? (
            <div className="p-4 bg-muted rounded-md text-lg leading-relaxed flex justify-center items-center h-32">
              Loading AI-generated text...
            </div>
          ) : (
            <div className="p-4 bg-muted dark:bg-gray-800 rounded-md text-lg leading-relaxed max-h-48 overflow-y-auto">
              {renderSampleText()}
            </div>
          )}

          <div>
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
          </div>

          {/* Word Analysis */}
          {isStarted && typedWords.length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm">
              {typedWords.map((word, index) => (
                <Badge
                  key={`word-${word.text}-${index}`}
                  variant={word.isCorrect ? "default" : word.isPartiallyCorrect ? "outline" : "destructive"}
                  className="px-2 py-1"
                >
                  {word.text}
                  {!word.isCorrect && <span className="ml-1 text-xs">({word.errorCount})</span>}
                </Badge>
              ))}
            </div>
          )}

          {isFinished && (
            <Tabs defaultValue="results">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="results">
                  <Trophy className="mr-2 h-4 w-4" />
                  Results
                </TabsTrigger>
                <TabsTrigger value="stats">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Stats
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="mr-2 h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="mt-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md p-4">
                  <h3 className="text-xl font-bold mb-2">Test Results</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Words Per Minute</p>
                      <p className="text-2xl font-bold">{wpm}</p>
                      <p className="text-xs text-muted-foreground">
                        {calculationMethod === "actual" ? "Based on actual words" : "Based on characters/5"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Characters Per Minute</p>
                      <p className="text-2xl font-bold">{cpm}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                      <p className="text-2xl font-bold">{accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Errors</p>
                      <p className="text-2xl font-bold">{errors}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Words Typed</p>
                      <p className="text-2xl font-bold">{typedWords.length}</p>
                      <p className="text-xs text-muted-foreground">
                        {correctWords} correct / {typedWords.length - correctWords} incorrect
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Difficulty</p>
                      <p className="text-2xl font-bold capitalize">{difficulty}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Max Streak</p>
                      <p className="text-2xl font-bold">{maxStreak}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" onClick={shareResult}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Result
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="mt-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-md p-4">
                  <h3 className="text-xl font-bold mb-2">Detailed Statistics</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Characters Typed</p>
                      <p className="text-xl font-bold">{text.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Words Typed</p>
                      <p className="text-xl font-bold">{typedWords.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Correct Words</p>
                      <p className="text-xl font-bold">{correctWords}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Word Accuracy</p>
                      <p className="text-xl font-bold">
                        {typedWords.length > 0 ? Math.round((correctWords / typedWords.length) * 100) : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average WPM</p>
                      <p className="text-xl font-bold">
                        {testHistory.length > 0
                          ? Math.round(testHistory.reduce((sum, result) => sum + result.wpm, 0) / testHistory.length)
                          : 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Personal Best</p>
                      <p className="text-xl font-bold">
                        {personalBest ? `${personalBest.wpm} WPM (${formatDate(personalBest.date)})` : "No record yet"}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900 rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold">Test History</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={exportHistory}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearHistory}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Clear
                      </Button>
                    </div>
                  </div>

                  {testHistory.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {testHistory.map((result) => (
                        <div key={result.id} className="border rounded p-2 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{formatDate(result.date)}</p>
                            <p className="text-sm text-muted-foreground">
                              {result.wpm} WPM, {result.accuracy}% accuracy, {result.difficulty}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {result.correctWords}/{result.wordCount} words correct
                            </p>
                          </div>
                          <Badge>{result.errors} errors</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No test history yet</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Visual Keyboard */}
          {showKeyboard && !focusMode && (
            <div className="hidden md:block">
              <div className="bg-slate-100 dark:bg-gray-800 p-2 rounded-md">
                <div className="flex justify-center mb-1">
                  {keyboardLayouts[keyboardLayout][0].map((key) => (
                    <div
                      key={`key-${key}`}
                      className={`w-10 h-10 m-0.5 flex items-center justify-center rounded-md border ${
                        currentKey === key
                          ? "bg-primary text-primary-foreground"
                          : sampleText[text.length] === key
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
                          : sampleText[text.length] === key
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
                          : sampleText[text.length] === key
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
                        : sampleText[text.length] === " "
                          ? "bg-primary/20"
                          : "bg-white dark:bg-gray-700"
                    }`}
                  >
                    SPACE
                  </div>
                </div>
              </div>
            </div>
          )}

          {!focusMode && (
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Press <kbd className="px-1 py-0.5 bg-muted rounded border">Ctrl</kbd> +{" "}
                <kbd className="px-1 py-0.5 bg-muted rounded border">Space</kbd> to start/pause,{" "}
                <kbd className="px-1 py-0.5 bg-muted rounded border">Esc</kbd> to reset
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center gap-4">
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
        </CardFooter>
      </Card>
    </div>
  )
}


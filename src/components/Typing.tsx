"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Settings, Moon, Sun } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

type TextSource = "quotes" | "paragraphs" | "code" | "ai-generated"

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
  const [errorPositions, setErrorPositions] = useState<number[]>([])
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
  const [textSource, setTextSource] = useState<TextSource>("quotes");
  const [language, setLanguage] = useState<string>("javascript")
  const [errorSound, setErrorSound] = useState<HTMLAudioElement | null>(null)
  const [successSound, setSuccessSound] = useState<HTMLAudioElement | null>(null)
  const [finishSound, setFinishSound] = useState<HTMLAudioElement | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [correctWords, setCorrectWords] = useState(0)
  const [typedWords, setTypedWords] = useState<WordData[]>([])
  const [calculationMethod, setCalculationMethod] = useState<"traditional" | "actual">("actual")
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

  // Fetch random text based on difficulty and source
  const fetchRandomText = useCallback(async () => {
    setIsLoading(true);
    try {
      let text = "";
    
    // Use Gemini API for AI-generated content or when specifically requested
    if (textSource === "ai-generated") {
      try {
        const response = await fetch("/api/generate-text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            difficulty,
            type: "paragraphs", // Default to paragraphs for AI-generated content
            language: language,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          text = data.content;
        } else {
          throw new Error("Gemini API failed");
        }
      } catch (geminiError) {
        console.warn("Gemini API failed:", geminiError);
        // Fall back to a default message if AI generation fails
        text = "The AI text generation service is currently unavailable. Please try again later or select a different text source.";
      }
    } else if (textSource === "quotes") {
      // Existing quotes logic
      let apiUrl = "https://api.quotable.io/random";
      
      // Adjust length based on difficulty
      switch(difficulty) {
        case "easy":
          apiUrl += "?minLength=50&maxLength=100";
          break;
        case "medium":
          apiUrl += "?minLength=100&maxLength=200";
          break;
        case "hard":
          apiUrl += "?minLength=200&maxLength=300";
          break;
        case "expert":
          apiUrl += "?minLength=300&maxLength=500";
          break;
      }
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      text = data.content;
    } else if (textSource === "paragraphs") {
      // Existing paragraphs logic
      let paragraphCount = 1;
      
      switch(difficulty) {
        case "easy":
          paragraphCount = 1;
          break;
        case "medium":
          paragraphCount = 2;
          break;
        case "hard":
          paragraphCount = 3;
          break;
        case "expert":
          paragraphCount = 4;
          break;
      }
      
      const response = await fetch(`https://baconipsum.com/api/?type=all-meat&paras=${paragraphCount}&format=text`);
      text = await response.text();
    } else if (textSource === "code") {
      // Simulated code snippets for different languages
      const codeSnippets = {
        javascript: [
          `function calculateFactorial(n) {\n  if (n === 0 || n === 1) {\n    return 1;\n  }\n  return n * calculateFactorial(n - 1);\n}`,
          `const fetchData = async (url) => {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error("Error fetching data:", error);\n  }\n};`,
          `class Person {\n  constructor(name, age) {\n    this.name = name;\n    this.age = age;\n  }\n\n  greet() {\n    return \`Hello, my name is \${this.name} and I am \${this.age} years old.\`;\n  }\n}`
        ],
        python: [
          `def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n\nfor i in range(10):\n    print(fibonacci(i))`,
          `import requests\n\ndef get_data(url):\n    try:\n        response = requests.get(url)\n        return response.json()\n    except Exception as e:\n        print(f"Error fetching data: {e}")\n        return None`,
          `class Animal:\n    def __init__(self, name, species):\n        self.name = name\n        self.species = species\n    \n    def make_sound(self):\n        pass\n\nclass Dog(Animal):\n    def make_sound(self):\n        return "Woof!"`
        ],
        html: [
          `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n    <p>This is a paragraph.</p>\n</body>\n</html>`,
          `<div class="container">\n    <header>\n        <nav>\n            <ul>\n                <li><a href="#">Home</a></li>\n                <li><a href="#">About</a></li>\n                <li><a href="#">Contact</a></li>\n            </ul>\n        </nav>\n    </header>\n    <main>\n        <h1>Welcome</h1>\n    </main>\n</div>`
        ]
      };
      
      // Get snippets for the selected language or default to JavaScript
      const snippets = codeSnippets[language as keyof typeof codeSnippets] || codeSnippets.javascript;
      
      // Select a random snippet
      const randomIndex = Math.floor(Math.random() * snippets.length);
      text = snippets[randomIndex];
    }
    
    setSampleText(text);
    
    // Count words in the sample text
    setWordCount(countWords(text));
    
    // Parse the text into character data
    const parsedChars = text.split('').map(char => ({ char }));
    setParsedText(parsedChars);
    
  } catch (error) {
    console.error("Failed to fetch random text:", error);
    // Fallback to a default text if all APIs fail
    const fallbackText = "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.";
    setSampleText(fallbackText);
    setParsedText(fallbackText.split('').map(char => ({ char })));
    setWordCount(countWords(fallbackText));
  } finally {
    setIsLoading(false);
  }
}, [difficulty, textSource, language, countWords]);

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
    setErrorPositions([])
    setTypedWords([])
    setCorrectWords(0)

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
    setErrorPositions([])
    setTypedWords([])
    setCorrectWords(0)
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

          // Play error sound
          if (soundEnabled && errorSound && showInstantFeedback) {
            errorSound.currentTime = 0
            errorSound.play().catch((e) => console.error("Error playing sound:", e))
          }
        } else if (soundEnabled && successSound && showInstantFeedback && i === inputValue.length - 1) {
          // Play success sound for the last character typed if it's correct
          successSound.currentTime = 0
          successSound.play().catch((e) => console.error("Error playing sound:", e))
        }
      }
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
    setErrorPositions(newErrorPositions)

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

  const renderSampleText = () => {
    return (
      <div ref={textContainerRef} className="text-wrap break-all">
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

          // Add word boundary visualization
          if (charData.char === " ") {
            className += " border-b border-dashed border-gray-400"
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
      <Card className="dark:bg-gray-900 dark:text-gray-100">
        <CardHeader className="text-center">
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
                      <Label htmlFor="theme" className="text-right">
                        Theme
                      </Label>
                      <Select
                        value={theme}
                        onValueChange={(value) => setTheme(value as ThemeMode)}
                        className="col-span-3"
                      >
                        <SelectTrigger id="theme">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="calculation-method" className="text-right">
                        WPM Calculation
                      </Label>
                      <Select
                        value={calculationMethod}
                        onValueChange={(value) => setCalculationMethod(value as "traditional" | "actual")}
                        className="col-span-3"
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

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="duration" className="text-right">
                        Duration
                      </Label>
                      <Select
                        value={testDuration.toString()}
                        onValueChange={(value) => setTestDuration(Number.parseInt(value))}
                        className="col-span-3"
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

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="text-source" className="text-right">
                        Text Source
                      </Label>
                      <Select
                        value={textSource}
                        onValueChange={(value) => setTextSource(value as TextSource)}
                        disabled={isStarted}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Text type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ai-generated">AI Generated</SelectItem>
                          <SelectItem value="quotes">Quotes</SelectItem>
                          <SelectItem value="paragraphs">Paragraphs</SelectItem>
                          <SelectItem value="code">Code</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {textSource === "code" && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="language" className="text-right">
                          Language
                        </Label>
                        <Select value={language} onValueChange={setLanguage} className="col-span-3">
                          <SelectTrigger id="language">
                            <SelectValue placeholder="Programming language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="html">HTML</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="keyboard" className="text-right">
                        Keyboard
                      </Label>\


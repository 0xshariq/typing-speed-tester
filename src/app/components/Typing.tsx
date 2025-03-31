"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, RotateCcw, Trophy, BarChart3, History } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type TestResult = {
  wpm: number
  cpm: number
  accuracy: number
  errors: number
  time: number
  date: Date
}

type DifficultyLevel = "easy" | "medium" | "hard"

export default function TypingSpeedTester() {
  const [text, setText] = useState("")
  const [sampleText, setSampleText] = useState("")
  const [isStarted, setIsStarted] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [wpm, setWpm] = useState(0)
  const [cpm, setCpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [errors, setErrors] = useState(0)
  const [errorPositions, setErrorPositions] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium")
  const [testHistory, setTestHistory] = useState<TestResult[]>([])
  const [currentKey, setCurrentKey] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch random text based on difficulty
  const fetchRandomText = useCallback(async () => {
    setIsLoading(true)
    try {
      let apiUrl = "https://api.quotable.io/random"

      // Adjust length based on difficulty
      switch (difficulty) {
        case "easy":
          apiUrl += "?minLength=50&maxLength=100"
          break
        case "medium":
          apiUrl += "?minLength=100&maxLength=200"
          break
        case "hard":
          apiUrl += "?minLength=200&maxLength=300"
          break
      }

      const response = await fetch(apiUrl)
      const data = await response.json()
      setSampleText(data.content)
    } catch (error) {
      console.error("Failed to fetch random text:", error)
      // Fallback to a default text if API fails
      setSampleText(
        "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.",
      )
    } finally {
      setIsLoading(false)
    }
  }, [difficulty])

  useEffect(() => {
    fetchRandomText()
  }, [fetchRandomText])

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
        calculateStats()
      }, 1000)
    } else if (timeLeft === 0) {
      finishTest()
    }

    return () => clearInterval(timer)
  }, [isStarted, timeLeft])

  const startTest = () => {
    setText("")
    setIsStarted(true)
    setIsFinished(false)
    setTimeLeft(60)
    setWpm(0)
    setCpm(0)
    setAccuracy(100)
    setErrors(0)
    setErrorPositions([])
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const resetTest = () => {
    setText("")
    setIsStarted(false)
    setIsFinished(false)
    setTimeLeft(60)
    setWpm(0)
    setCpm(0)
    setAccuracy(100)
    setErrors(0)
    setErrorPositions([])
    fetchRandomText()
  }

  const finishTest = () => {
    setIsFinished(true)
    setIsStarted(false)

    // Save test result to history
    const newResult: TestResult = {
      wpm,
      cpm,
      accuracy,
      errors,
      time: 60 - timeLeft,
      date: new Date(),
    }

    setTestHistory((prev) => [newResult, ...prev].slice(0, 10)) // Keep only last 10 tests
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setText(inputValue)

    // Calculate errors and track error positions
    let errorCount = 0
    const newErrorPositions: number[] = []

    for (let i = 0; i < inputValue.length; i++) {
      if (inputValue[i] !== sampleText[i]) {
        errorCount++
        newErrorPositions.push(i)
      }
    }

    setErrors(errorCount)
    setErrorPositions(newErrorPositions)

    // Calculate accuracy
    const accuracyValue = inputValue.length > 0 ? Math.max(0, 100 - (errorCount / inputValue.length) * 100) : 100
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

    // Allow Escape key to reset the test
    if (e.key === "Escape") {
      resetTest()
    }
  }

  const handleKeyUp = () => {
    setCurrentKey(null)
  }

  const calculateStats = () => {
    // Calculate WPM (Words Per Minute)
    // Words are traditionally counted as 5 characters
    const words = text.length / 5
    const minutes = (60 - timeLeft) / 60
    const calculatedWpm = minutes > 0 ? Math.round(words / minutes) : 0
    setWpm(calculatedWpm)

    // Calculate CPM (Characters Per Minute)
    const calculatedCpm = minutes > 0 ? Math.round(text.length / minutes) : 0
    setCpm(calculatedCpm)
  }

  const renderSampleText = () => {
    return sampleText.split("").map((char, index) => {
      let className = "text-muted-foreground"

      if (index < text.length) {
        className = text[index] === char ? "text-green-500 font-medium" : "text-red-500 font-medium"
      }

      // Highlight current position
      if (index === text.length) {
        className += " bg-primary/20 px-0.5 animate-pulse"
      }

      return (
        <span key={`${char}-${index}-${Math.random()}`} className={className}>
          {char}
        </span>
      )
    })
  }

  const getProgressValue = () => {
    return isStarted ? ((60 - timeLeft) / 60) * 100 : 0
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Keyboard layout for visual feedback
  const keyboardRows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ]

  return (
    <div className="container max-w-4xl py-10 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Typing Speed Test</CardTitle>
          <CardDescription>Test your typing speed and accuracy with random texts from the internet</CardDescription>
          <div className="flex justify-center mt-2">
            <Select
              value={difficulty}
              onValueChange={(value) => setDifficulty(value as DifficultyLevel)}
              disabled={isStarted}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-xl font-medium">{timeLeft}s</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-sm">
                      WPM: {wpm}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Words Per Minute</p>
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
                    <p>Percentage of correct keystrokes</p>
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
                    <p>Number of typing errors</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <Progress value={getProgressValue()} className="h-2" />

          {isLoading ? (
            <div className="p-4 bg-muted rounded-md text-lg leading-relaxed flex justify-center items-center h-32">
              Loading random text...
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-md text-lg leading-relaxed max-h-48 overflow-y-auto">
              {renderSampleText()}
            </div>
          )}

          <div>
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              disabled={!isStarted || isFinished || isLoading}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={isStarted ? "Start typing..." : "Click 'Start Test' to begin"}
            />
          </div>

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
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="text-xl font-bold mb-2">Test Results</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Words Per Minute</p>
                      <p className="text-2xl font-bold">{wpm}</p>
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
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="text-2xl font-bold">{60 - timeLeft}s</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Difficulty</p>
                      <p className="text-2xl font-bold capitalize">{difficulty}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-xl font-bold mb-2">Detailed Statistics</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Characters Typed</p>
                      <p className="text-xl font-bold">{text.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Error Rate</p>
                      <p className="text-xl font-bold">
                        {text.length > 0 ? Math.round((errors / text.length) * 100) : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Correct Characters</p>
                      <p className="text-xl font-bold">{text.length - errors}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average WPM</p>
                      <p className="text-xl font-bold">
                        {testHistory.length > 0
                          ? Math.round(testHistory.reduce((sum, result) => sum + result.wpm, 0) / testHistory.length)
                          : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                  <h3 className="text-xl font-bold mb-2">Test History</h3>
                  {testHistory.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {testHistory.map((result, index) => (
                        <div key={`${result.date}-${index}-${Math.random()}`} className="border rounded p-2 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{formatDate(result.date)}</p>
                            <p className="text-sm text-muted-foreground">
                              {result.wpm} WPM, {result.accuracy}% accuracy
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
          <div className="hidden md:block">
            <div className="bg-slate-100 p-2 rounded-md">
              <div className="flex justify-center mb-1">
                {keyboardRows[0].map((key) => (
                  <div
                    key={key}
                    className={`w-10 h-10 m-0.5 flex items-center justify-center rounded-md border ${
                      currentKey === key
                        ? "bg-primary text-primary-foreground"
                        : sampleText[text.length] === key
                          ? "bg-primary/20"
                          : "bg-white"
                    }`}
                  >
                    {key.toUpperCase()}
                  </div>
                ))}
              </div>
              <div className="flex justify-center mb-1">
                <div className="w-5" /> {/* Offset for second row */}
                {keyboardRows[1].map((key) => (
                  <div
                    key={key}
                    className={`w-10 h-10 m-0.5 flex items-center justify-center rounded-md border ${
                      currentKey === key
                        ? "bg-primary text-primary-foreground"
                        : sampleText[text.length] === key
                          ? "bg-primary/20"
                          : "bg-white"
                    }`}
                  >
                    {key.toUpperCase()}
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <div className="w-10"/> {/* Offset for third row */}
                {keyboardRows[2].map((key) => (
                  <div
                    key={key}
                    className={`w-10 h-10 m-0.5 flex items-center justify-center rounded-md border ${
                      currentKey === key
                        ? "bg-primary text-primary-foreground"
                        : sampleText[text.length] === key
                          ? "bg-primary/20"
                          : "bg-white"
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
                        : "bg-white"
                  }`}
                >
                  SPACE
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center gap-4">
          {!isStarted && (
            <Button onClick={startTest} size="lg" disabled={isLoading}>
              {isFinished ? "Try Again" : "Start Test"}
            </Button>
          )}
          {isStarted && (
            <Button variant="outline" onClick={resetTest} size="lg">
              Reset
            </Button>
          )}
          {isFinished && (
            <Button variant="outline" onClick={resetTest} size="lg">
              <RotateCcw className="mr-2 h-4 w-4" />
              New Test
            </Button>
          )}
          {!isStarted && !isFinished && (
            <Button variant="outline" onClick={fetchRandomText} size="lg" disabled={isLoading}>
              <RotateCcw className="mr-2 h-4 w-4" />
              New Text
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}


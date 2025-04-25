"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, BarChart3, History, Share2, Download, RotateCcw } from "lucide-react"
import type { TestResult } from "@/types"

interface ResultsTabsProps {
  isFinished: boolean
  wpm: number
  netWpm: number
  cpm: number
  accuracy: number
  errors: number
  errorRate: number
  typedWords: { text: string; isCorrect: boolean; isPartiallyCorrect: boolean; errorCount: number }[]
  correctWords: number
  difficulty: string
  maxStreak: number
  calculationMethod: string
  text: string
  testHistory: TestResult[]
  totalKeystrokes: number
  correctKeystrokes: number
  shareResult: () => void
  exportHistory: () => void
  clearHistory: () => void
  formatDate: (date: Date) => string
}

export function ResultsTabs({
  isFinished,
  wpm,
  netWpm,
  cpm,
  accuracy,
  errors,
  errorRate,
  typedWords,
  correctWords,
  difficulty,
  maxStreak,
  calculationMethod,
  text,
  testHistory,
  totalKeystrokes,
  correctKeystrokes,
  shareResult,
  exportHistory,
  clearHistory,
  formatDate,
}: ResultsTabsProps) {
  if (!isFinished) {
    return null
  }

  return (
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
                {calculationMethod === "standard"
                  ? "Standard calculation"
                  : calculationMethod === "actual"
                    ? "Based on actual words"
                    : "Based on characters/5"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net WPM</p>
              <p className="text-2xl font-bold">{netWpm}</p>
              <p className="text-xs text-muted-foreground">WPM minus errors per minute</p>
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
              <p className="text-xs text-muted-foreground">Error rate: {errorRate} per minute</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Words Typed</p>
              <p className="text-2xl font-bold">{typedWords.length}</p>
              <p className="text-xs text-muted-foreground">
                {correctWords} correct / {typedWords.length - correctWords} incorrect
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Keystrokes</p>
              <p className="text-2xl font-bold">{totalKeystrokes}</p>
              <p className="text-xs text-muted-foreground">
                {correctKeystrokes} correct / {totalKeystrokes - correctKeystrokes} incorrect
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
              <p className="text-sm text-muted-foreground">Keystroke Accuracy</p>
              <p className="text-xl font-bold">
                {totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 0}%
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
              <p className="text-sm text-muted-foreground">Average Net WPM</p>
              <p className="text-xl font-bold">
                {testHistory.length > 0
                  ? Math.round(testHistory.reduce((sum, result) => sum + (result.netWpm || 0), 0) / testHistory.length)
                  : 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Personal Best</p>
              <p className="text-xl font-bold">
                {testHistory.length > 0
                  ? `${Math.max(...testHistory.map((result) => result.wpm))} WPM`
                  : "No record yet"}
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
                      {result.wpm} WPM ({result.netWpm || 0} Net), {result.accuracy}% accuracy, {result.difficulty}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.correctWords}/{result.wordCount} words correct
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge>{result.errors} errors</Badge>
                    <span className="text-xs text-muted-foreground mt-1">{result.errorRate || 0} errors/min</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No test history yet</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}

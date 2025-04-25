"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Moon, Sun, Trophy } from "lucide-react"
import { SettingsDialog } from "./settings-dialog"
import { StatsDropdown } from "./stats-dropdown"
import type { DifficultyLevel, TestResult, TextType, ThemeMode } from "@/types"

interface HeaderProps {
  personalBest: TestResult | null
  theme: string
  setTheme: (theme: ThemeMode) => void
  difficulty: DifficultyLevel
  setDifficulty: (difficulty: DifficultyLevel) => void
  textType: TextType
  setTextType: (textType: TextType) => void
  isStarted: boolean
  focusMode: boolean
  exportHistory: () => void
  clearHistory: () => void
  isFinished: boolean
  shareResult: () => void
}

export function Header({
  personalBest,
  theme,
  setTheme,
  difficulty,
  setDifficulty,
  textType,
  setTextType,
  isStarted,
  focusMode,
  exportHistory,
  clearHistory,
  isFinished,
  shareResult,
}: HeaderProps) {
  if (focusMode) {
    return <CardHeader className="pb-2" />
  }

  return (
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

          <SettingsDialog />

          <StatsDropdown
            exportHistory={exportHistory}
            clearHistory={clearHistory}
            isFinished={isFinished}
            shareResult={shareResult}
          />
        </div>
      </div>

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
    </CardHeader>
  )
}

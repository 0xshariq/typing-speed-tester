import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Info, Award, Zap } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StatsDisplayProps {
  timeLeft: number
  streakCount: number
  maxStreak: number
  showStreakCounter: boolean
  wpm: number
  netWpm: number
  cpm: number
  accuracy: number
  errors: number
  errorRate: number
  calculationMethod: "traditional" | "actual" | "standard"
}

export function StatsDisplay({
  timeLeft,
  streakCount,
  maxStreak,
  showStreakCounter,
  wpm,
  netWpm,
  cpm,
  accuracy,
  errors,
  errorRate,
  calculationMethod,
}: StatsDisplayProps) {
  return (
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
              <p>
                {calculationMethod === "standard"
                  ? "Standard words per minute (all typed entries / 5 / minutes)"
                  : calculationMethod === "actual"
                    ? "Actual words per minute"
                    : "Characters/5 per minute"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-sm">
                Net WPM: {netWpm}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Net words per minute (WPM minus errors per minute)</p>
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
                {calculationMethod === "standard"
                  ? "Percentage of correct keystrokes"
                  : calculationMethod === "actual"
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
              <p>
                {calculationMethod === "standard"
                  ? "Number of incorrect keystrokes"
                  : calculationMethod === "actual"
                    ? "Number of word errors"
                    : "Number of character errors"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-sm">
                Error Rate: {errorRate}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Errors per minute</p>
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
                {calculationMethod === "standard"
                  ? "Using standard calculation: All typed entries / 5 / minutes, with accuracy based on correct keystrokes"
                  : calculationMethod === "actual"
                    ? "Using actual word count: Words are counted when you type a space"
                    : "Using traditional calculation: 5 characters = 1 word"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

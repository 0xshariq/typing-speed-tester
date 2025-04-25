"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, Download, RotateCcw, Share2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface StatsDropdownProps {
  exportHistory: () => void
  clearHistory: () => void
  isFinished: boolean
  shareResult: () => void
}

export function StatsDropdown({ exportHistory, clearHistory, isFinished, shareResult }: StatsDropdownProps) {
  return (
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
  )
}

"use client"

import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Keyboard, RefreshCw } from "lucide-react"
import { useContext } from "react"
import { TypingTestContext } from "@/components/typing-test/typing-test-context"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Navbar() {
  const { resetAllSettings } = useContext(TypingTestContext)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Keyboard className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">TypeMaster</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-4">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              About
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Leaderboard
            </Link>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={resetAllSettings}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset all settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}

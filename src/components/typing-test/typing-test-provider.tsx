"use client"

import type React from "react"

import { useTypingTest } from "@/hooks/use-typing-test"
import { TypingTestContext } from "./typing-test-context"

interface TypingTestProviderProps {
  children: React.ReactNode
}

export function TypingTestProvider({ children }: TypingTestProviderProps) {
  const typingTest = useTypingTest()

  return <TypingTestContext.Provider value={typingTest}>{children}</TypingTestContext.Provider>
}

"use client"
import TypingSpeedTester from "@/components/typing-test/typing-speed-tester"
import { TypingTestProvider } from "@/components/typing-test/typing-test-provider"
import { useEffect } from "react"

export default function Home() {
  // Add a useEffect to handle page refresh
  useEffect(() => {
    // This will run when the component mounts (page loads)
    const handleBeforeUnload = () => {
      // Clear session-specific data on refresh
      sessionStorage.clear()
    }

    // Add event listener for page refresh/unload
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      // Clean up the event listener
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <TypingTestProvider>
        <main className="flex-1 flex items-center justify-center">
          <TypingSpeedTester />
        </main>
      </TypingTestProvider>
    </div>
  )
}

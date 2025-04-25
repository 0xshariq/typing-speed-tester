import TypingSpeedTester from "@/components/typing-test/typing-speed-tester"
import { TypingTestProvider } from "@/components/typing-test/typing-test-provider"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 flex items-center justify-center">
        <TypingTestProvider>
          <TypingSpeedTester />
        </TypingTestProvider>
      </main>
    </div>
  )
}

"use client"

import { useContext } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Header } from "./header"
import { StatsDisplay } from "./stats-display"
import { TextDisplay } from "./text-display"
import { TypingInput } from "./typing-input"
import { WordAnalysis } from "./word-analysis"
import { ResultsTabs } from "./results-tabs"
import { VisualKeyboard } from "./visual-keyboard"
import { KeyboardShortcuts } from "./keyboard-shortcuts"
import { TestControls } from "./test-controls"
import { TypingTestContext } from "./typing-test-context"

export default function TypingSpeedTester() {
  const {
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
    timeLeft,
    streakCount,
    maxStreak,
    showStreakCounter,
    wpm,
    cpm,
    accuracy,
    errors,
    calculationMethod,
    getProgressValue,
    isLoading,
    parsedText,
    getFontSizeClass,
    textContainerRef,
    typedWords,
    showKeyboard,
    keyboardLayout,
    currentKey,
    sampleText,
    text,
    isPaused,
    startTest,
    pauseTest,
    resumeTest,
    resetTest,
    fetchRandomText,
    correctWords,
    testHistory,
    formatDate,
  } = useContext(TypingTestContext)

  return (
    <div className="container max-w-5xl py-10 px-4 mx-auto">
      <Card className={`dark:bg-gray-900 dark:text-gray-100 ${focusMode ? "focus-mode" : ""} max-w-4xl mx-auto`}>
        <Header
          personalBest={personalBest}
          theme={theme}
          setTheme={setTheme}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          textType={textType}
          setTextType={setTextType}
          isStarted={isStarted}
          focusMode={focusMode}
          exportHistory={exportHistory}
          clearHistory={clearHistory}
          isFinished={isFinished}
          shareResult={shareResult}
        />

        <CardContent className="space-y-6">
          <StatsDisplay
            timeLeft={timeLeft}
            streakCount={streakCount}
            maxStreak={maxStreak}
            showStreakCounter={showStreakCounter}
            wpm={wpm}
            cpm={cpm}
            accuracy={accuracy}
            errors={errors}
            calculationMethod={calculationMethod}
          />

          <Progress value={getProgressValue()} className="h-2" />

          <TextDisplay
            isLoading={isLoading}
            parsedText={parsedText}
            fontSizeClass={getFontSizeClass()}
            textContainerRef={textContainerRef}
          />

          <TypingInput />

          <WordAnalysis isStarted={isStarted} typedWords={typedWords} />

          <ResultsTabs
            isFinished={isFinished}
            wpm={wpm}
            cpm={cpm}
            accuracy={accuracy}
            errors={errors}
            typedWords={typedWords}
            correctWords={correctWords}
            difficulty={difficulty}
            maxStreak={maxStreak}
            calculationMethod={calculationMethod}
            text={text}
            testHistory={testHistory}
            shareResult={shareResult}
            exportHistory={exportHistory}
            clearHistory={clearHistory}
            formatDate={formatDate}
          />

          <VisualKeyboard
            showKeyboard={showKeyboard}
            focusMode={focusMode}
            keyboardLayout={keyboardLayout}
            currentKey={currentKey}
            sampleText={sampleText}
            textLength={text.length}
          />

          <KeyboardShortcuts focusMode={focusMode} />
        </CardContent>

        <CardFooter className="flex justify-center gap-4">
          <TestControls
            isStarted={isStarted}
            isPaused={isPaused}
            isFinished={isFinished}
            isLoading={isLoading}
            startTest={startTest}
            pauseTest={pauseTest}
            resumeTest={resumeTest}
            resetTest={resetTest}
            fetchRandomText={fetchRandomText}
          />
        </CardFooter>
      </Card>
    </div>
  )
}

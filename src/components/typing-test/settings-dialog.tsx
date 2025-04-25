"use client"

import { useContext } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Settings, Volume2, VolumeX, KeyboardIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TypingTestContext } from "@/components/typing-test/typing-test-context"
import type { FontSize, KeyboardLayout } from "@/types"

export function SettingsDialog() {
  const {
    calculationMethod,
    setCalculationMethod,
    testDuration,
    setTestDuration,
    textType,
    setTextType,
    fontSize,
    setFontSize,
    keyboardLayout,
    setKeyboardLayout,
    showKeyboard,
    setShowKeyboard,
    focusMode,
    setFocusMode,
    showStreakCounter,
    setShowStreakCounter,
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    showInstantFeedback,
    setShowInstantFeedback,
    isStarted,
  } = useContext(TypingTestContext)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Customize your typing test experience</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="calculation-method" className="text-right">
              WPM Calculation
            </Label>
            <div className="col-span-3">
              <Select
                value={calculationMethod}
                onValueChange={(value) => setCalculationMethod(value as "traditional" | "actual")}
              >
                <SelectTrigger id="calculation-method">
                  <SelectValue placeholder="Calculation method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actual">Actual Words</SelectItem>
                  <SelectItem value="traditional">Traditional (chars/5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              Duration
            </Label>
            <div className="col-span-3">
              <Select
                value={testDuration.toString()}
                onValueChange={(value) => setTestDuration(Number.parseInt(value))}
              >
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Test duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="120">2 minutes</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="text-type" className="text-right">
              Text Type
            </Label>
            <div className="col-span-3">
              <Select value={textType} onValueChange={(value) => setTextType(value as any)} disabled={isStarted}>
                <SelectTrigger id="text-type">
                  <SelectValue placeholder="Text type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paragraphs">Paragraphs</SelectItem>
                  <SelectItem value="quotes">Quotes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="font-size" className="text-right">
              Font Size
            </Label>
            <div className="col-span-3">
              <Select value={fontSize} onValueChange={(value) => setFontSize(value as FontSize)}>
                <SelectTrigger id="font-size">
                  <SelectValue placeholder="Font size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="keyboard" className="text-right">
              Keyboard
            </Label>
            <div className="col-span-3">
              <Select value={keyboardLayout} onValueChange={(value) => setKeyboardLayout(value as KeyboardLayout)}>
                <SelectTrigger id="keyboard">
                  <SelectValue placeholder="Keyboard layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qwerty">QWERTY</SelectItem>
                  <SelectItem value="dvorak">Dvorak</SelectItem>
                  <SelectItem value="colemak">Colemak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="show-keyboard" className="text-right">
              Show Keyboard
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch id="show-keyboard" checked={showKeyboard} onCheckedChange={setShowKeyboard} />
              <Label htmlFor="show-keyboard">
                <KeyboardIcon className="h-4 w-4 ml-2" />
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="focus-mode" className="text-right">
              Focus Mode
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch id="focus-mode" checked={focusMode} onCheckedChange={setFocusMode} />
              <Label htmlFor="focus-mode">Hide distractions</Label>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="streak-counter" className="text-right">
              Streak Counter
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch id="streak-counter" checked={showStreakCounter} onCheckedChange={setShowStreakCounter} />
              <Label htmlFor="streak-counter">Show streak counter</Label>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sound-toggle" className="text-right">
              Sound
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch id="sound-toggle" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              <Label htmlFor="sound-toggle">
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Label>
            </div>
          </div>

          {soundEnabled && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="volume" className="text-right">
                Volume
              </Label>
              <div className="col-span-3">
                <Slider
                  id="volume"
                  min={0}
                  max={100}
                  step={1}
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="feedback-toggle" className="text-right">
              Instant Feedback
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch id="feedback-toggle" checked={showInstantFeedback} onCheckedChange={setShowInstantFeedback} />
              <Label htmlFor="feedback-toggle">Show real-time feedback</Label>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

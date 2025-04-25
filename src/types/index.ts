export type TestResult = {
    id: string
    wpm: number
    cpm: number
    accuracy: number
    errors: number
    time: number
    date: Date
    difficulty: DifficultyLevel
    textLength: number
    wordCount: number
    correctWords: number
  }
  
  export type DifficultyLevel = "easy" | "medium" | "hard" | "expert"
  export type ThemeMode = "light" | "dark" | "system"
  export type KeyboardLayout = "qwerty" | "dvorak" | "colemak"
  export type TextType = "paragraphs" | "quotes"
  export type FontSize = "small" | "medium" | "large"
  
  export interface CharacterData {
    char: string
    isCorrect?: boolean
    isCurrent?: boolean
  }
  
  export interface WordData {
    text: string
    isCorrect: boolean
    isPartiallyCorrect: boolean
    errorCount: number
  }
  
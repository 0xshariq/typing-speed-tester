interface KeyboardShortcutsProps {
    focusMode: boolean
  }
  
  export function KeyboardShortcuts({ focusMode }: KeyboardShortcutsProps) {
    if (focusMode) {
      return null
    }
  
    return (
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Press <kbd className="px-1 py-0.5 bg-muted rounded border">Ctrl</kbd> +{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded border">Space</kbd> to start/pause,{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded border">Esc</kbd> to reset
        </p>
      </div>
    )
  }
  
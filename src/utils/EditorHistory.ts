interface HistoryItem {
  code: string;
  timestamp: number;
}

class EditorHistory {
  private history: HistoryItem[] = [];
  private currentIndex: number = -1;
  private maxSize: number = 50; // Maximum number of history items to keep

  push(code: string): void {
    // If we're not at the end of the history, remove any forward history
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add the new state
    this.history.push({
      code,
      timestamp: Date.now()
    });

    // If we exceed the max size, remove the oldest item
    if (this.history.length > this.maxSize) {
      this.history.shift();
      this.currentIndex = this.history.length - 1;
    } else {
      this.currentIndex = this.history.length - 1;
    }
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  undo(): string | null {
    if (!this.canUndo()) {
      return null;
    }

    this.currentIndex--;
    return this.currentIndex >= 0 ? this.history[this.currentIndex].code : null;
  }

  redo(): string | null {
    if (!this.canRedo()) {
      return null;
    }

    this.currentIndex++;
    return this.history[this.currentIndex].code;
  }

  getCurrent(): string | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex].code;
    }
    return null;
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }
}

export default EditorHistory;
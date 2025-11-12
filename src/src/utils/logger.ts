export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log('[SolixDB:DEBUG]', ...args);
    }
  }

  info(...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log('[SolixDB:INFO]', ...args);
    }
  }

  warn(...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn('[SolixDB:WARN]', ...args);
    }
  }

  error(...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error('[SolixDB:ERROR]', ...args);
    }
  }
}

export const logger = new Logger();
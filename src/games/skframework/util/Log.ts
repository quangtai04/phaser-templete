abstract class Log {
  static readonly DEBUG: integer = 1 << 0;
  static readonly INFO: integer = 1 << 1;
  static readonly WARN: integer = 1 << 2;
  static readonly ERROR: integer = 1 << 3;

  static getLog(name: string, level: integer): Log {
    switch (level) {
      case Log.DEBUG:
        return new DebugLog(name);

      case Log.INFO:
        return new InfoLog(name);

      case Log.WARN:
        return new WarnLog(name);

      case Log.ERROR:
        return new ErrorLog(name);
    }
  }

  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  d(...args: any[]): void {}

  i(...args: any[]): void {}

  w(...args: any[]): void {}

  e(...args: any[]): void {}
}

class ErrorLog extends Log {
  e(...args: any[]) {
    console.error(`[${new Date().toISOString()}] [${this.name}]`, ...args);
  }
}

class WarnLog extends ErrorLog {
  w(...args: any[]) {
    console.warn(`[${new Date().toISOString()}] [${this.name}]`, ...args);
  }
}

class InfoLog extends WarnLog {
  i(...args: any[]) {
    console.info(`[${new Date().toISOString()}] [${this.name}]`, ...args);
  }
}

class DebugLog extends InfoLog {
  d(...args: any[]) {
    console.log(`[${new Date().toISOString()}] [${this.name}]`, ...args);
  }
}

export default Log;

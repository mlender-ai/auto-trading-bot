type Level = "INFO" | "WARN" | "ERROR";

function write(level: Level, message: string, context?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    context,
    timestamp: new Date().toISOString()
  };

  const line = JSON.stringify(payload);

  if (level === "ERROR") {
    console.error(line);
    return;
  }

  if (level === "WARN") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    write("INFO", message, context);
  },
  warn(message: string, context?: Record<string, unknown>) {
    write("WARN", message, context);
  },
  error(message: string, context?: Record<string, unknown>) {
    write("ERROR", message, context);
  }
};


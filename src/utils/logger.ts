import { env } from '../config/env.js';

// Niveaux de log
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Couleurs ANSI pour le terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Icônes par niveau
const icons: Record<LogLevel, string> = {
  debug: '🔍',
  info: 'ℹ️ ',
  warn: '⚠️ ',
  error: '❌',
};

// Couleurs par niveau
const levelColors: Record<LogLevel, string> = {
  debug: colors.gray,
  info: colors.cyan,
  warn: colors.yellow,
  error: colors.red,
};

// Formatter le timestamp
function formatTimestamp(): string {
  return new Date().toISOString();
}

// Formatter le message
function formatMessage(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = formatTimestamp();
  const color = levelColors[level];
  const icon = icons[level];

  let output = `${colors.gray}[${timestamp}]${colors.reset} ${icon} ${color}${level.toUpperCase()}${colors.reset}: ${message}`;

  if (meta !== undefined) {
    const metaStr = typeof meta === 'object' ? JSON.stringify(meta, null, 2) : String(meta);
    output += `\n${colors.gray}${metaStr}${colors.reset}`;
  }

  return output;
}

// Logger principal
export const logger = {
  debug(message: string, meta?: unknown): void {
    if (env.NODE_ENV === 'development') {
      console.log(formatMessage('debug', message, meta));
    }
  },

  info(message: string, meta?: unknown): void {
    console.log(formatMessage('info', message, meta));
  },

  warn(message: string, meta?: unknown): void {
    console.warn(formatMessage('warn', message, meta));
  },

  error(message: string, meta?: unknown): void {
    console.error(formatMessage('error', message, meta));
  },

  // Log d'une requête HTTP
  request(method: string, path: string, statusCode: number, duration: number): void {
    const color = statusCode >= 400 ? colors.red : statusCode >= 300 ? colors.yellow : colors.green;
    console.log(
      `${colors.gray}[${formatTimestamp()}]${colors.reset} ` +
        `${colors.magenta}${method}${colors.reset} ${path} ` +
        `${color}${statusCode}${colors.reset} - ${duration}ms`
    );
  },
};

export default logger;

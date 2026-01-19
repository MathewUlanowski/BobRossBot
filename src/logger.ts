import { createLogger, format, transports } from 'winston';
import * as fs from 'fs';
import * as path from 'path';

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const jsonFileFormat = format.combine(format.timestamp(), format.json());
const prettyConsoleFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} ${level}: ${message} ${metaStr}`;
  }),
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'bobrossbot' },
  transports: [
    new transports.File({
      filename: path.join(logDir, 'bobrossbot.log'),
      level: 'info',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      format: jsonFileFormat,
    }),
    new transports.Console({ format: prettyConsoleFormat }),
  ],
  exitOnError: false,
});

export default logger;

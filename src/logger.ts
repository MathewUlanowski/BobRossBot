import { createLogger, format, transports } from 'winston';
import * as fs from 'fs';
import * as path from 'path';

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}] ${message}`)
  ),
  transports: [
    new transports.File({ filename: path.join(logDir, 'bobrossbot.log'), level: 'info', maxsize: 5 * 1024 * 1024, maxFiles: 5 }),
    new transports.Console({ format: format.colorize({ all: true }) })
  ],
  exitOnError: false
});

export default logger;

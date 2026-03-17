import fs from "fs";
import path from "path";
import morgan from "morgan";

/*
  Ensure logs directory exists
*/
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

/*
  Create write stream for file logging
*/
const accessLogStream = fs.createWriteStream(
  path.join(logDir, "access.log"),
  { flags: "a" } // append mode
);

/*
  Custom log format
  Includes:
  - IP address
  - method
  - route
  - status
  - response time
*/
const format =
  ":remote-addr - :method :url :status :res[content-length] - :response-time ms";

/*
  Console logger (for development)
*/
export const consoleLogger = morgan("dev");

/*
  File logger (for production / persistent logs)
*/
export const fileLogger = morgan(format, {
  stream: accessLogStream,
});
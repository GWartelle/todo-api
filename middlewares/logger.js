const fs = require("fs");
const path = require("path");

const logger = (req, res, next) => {
  const logDirPath = path.join(__dirname, "../logs");

  if (!fs.existsSync(logDirPath)) {
    fs.mkdirSync(logDirPath);
  }

  const logFileName = `${new Date().toISOString().split("T")[0]}.log`;
  const logFilePath = path.join(logDirPath, logFileName);

  res.on("finish", () => {
    const logMessage = `${req.method} ${res.statusCode} 
    ${new Date().toISOString()} ${req.originalUrl}\n`;

    fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) {
        console.error("Failed to write to log file:", err);
      }
    });
  });

  next();
};

module.exports = logger;

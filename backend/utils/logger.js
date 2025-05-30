/**
 * Logger utility for consistent application logging
 */

// Define log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Set current log level based on environment
const CURRENT_LOG_LEVEL =
  process.env.NODE_ENV === "production" ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

/**
 * Format message with timestamp and additional metadata
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {string} - Formatted log message
 * @private
 */
const _formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length
    ? ` | ${JSON.stringify(meta)}`
    : "";

  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`;
};

/**
 * Log error message
 * @param {string} message - Error message
 * @param {Error|Object} error - Error object or metadata
 */
const error = (message, error = {}) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
    let meta = {};

    if (error instanceof Error) {
      meta = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else {
      meta = error;
    }

    console.error(_formatMessage("error", message, meta));
  }
};

/**
 * Log warning message
 * @param {string} message - Warning message
 * @param {Object} meta - Additional metadata
 */
const warn = (message, meta = {}) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
    console.warn(_formatMessage("warn", message, meta));
  }
};

/**
 * Log info message
 * @param {string} message - Info message
 * @param {Object} meta - Additional metadata
 */
const info = (message, meta = {}) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
    console.info(_formatMessage("info", message, meta));
  }
};

/**
 * Log debug message
 * @param {string} message - Debug message
 * @param {Object} meta - Additional metadata
 */
const debug = (message, meta = {}) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
    console.debug(_formatMessage("debug", message, meta));
  }
};

/**
 * Log database operation
 * @param {string} operation - Database operation (create, read, update, delete)
 * @param {string} model - Model name
 * @param {string|Object} id - Document ID or query
 * @param {Object} data - Operation data
 */
const dbOperation = (operation, model, id, data = {}) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
    const meta = {
      model,
      id: typeof id === "object" ? JSON.stringify(id) : id,
      data: process.env.NODE_ENV === "development" ? data : "[REDACTED]",
    };

    console.debug(
      _formatMessage("db", `${operation} operation on ${model}`, meta)
    );
  }
};

/**
 * Log API request
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const apiRequest = (req, res) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
    const meta = {
      method: req.method,
      path: req.path,
      params: req.params,
      query: req.query,
      ip: req.ip,
      user: req.user ? req.user._id : "anonymous",
    };

    console.info(_formatMessage("api", `${req.method} ${req.path}`, meta));
  }
};

/**
 * Log API response
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {number} time - Response time in milliseconds
 */
const apiResponse = (req, res, time) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
    const meta = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      time: `${time}ms`,
    };

    console.debug(
      _formatMessage(
        "api",
        `Response ${res.statusCode} for ${req.method} ${req.path}`,
        meta
      )
    );
  }
};

module.exports = {
  error,
  warn,
  info,
  debug,
  dbOperation,
  apiRequest,
  apiResponse,
};

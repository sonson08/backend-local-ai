const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const config = require('./config');

const healthRouter = require('./routes/health');
const scanRouter = require('./routes/scan');
const redactRouter = require('./routes/redact');

const app = express();

if (app.get('env') !== 'test') {
  app.use(logger('dev'));
}

// Reflect any origin until the extension ID is pinned and listed in ALLOWED_ORIGINS
app.use(cors({ origin: config.allowedOrigins.length > 0 ? config.allowedOrigins : true }));
app.use(express.json({ limit: '100kb' }));

app.use('/health', healthRouter);
app.use('/api/scan', scanRouter);
app.use('/api/redact', redactRouter);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    error: {
      // Only client errors are safe to echo; server error messages may leak internals
      message: err.expose ? err.message : 'Internal Server Error',
      ...(err.expose && err.details && { details: err.details }),
      ...(req.app.get('env') === 'development' && { stack: err.stack }),
    },
  });
});

module.exports = app;

// server/src/middleware/errorHandler.js
export default function errorHandler(err, req, res, next) {
  console.error(err.stack);

  const status = err.status || 500;
  const message = err.message || 'Something went wrong on the server';

  res.status(status).json({
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    console.error(err);
  }

  return res.status(status).json({
    error: err.message || 'Internal server error',
    ...(isProd ? {} : { stack: err.stack })
  });
};

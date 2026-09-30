export function notFoundHandler(request, response, next) {
  const error = new Error(`Route not found: ${request.method} ${request.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(error, request, response, _next) {
  let status = error.status || error.statusCode || 500;
  let message = error.message;

  if (error.name === 'ValidationError') {
    status = 400;
    message = Object.values(error.errors).map((item) => {
      if (item.name === 'CastError' && item.path === 'date') {
        return 'Expense date must be a valid date.';
      }
      if (item.name === 'CastError' && item.path === 'amount') {
        return 'Expense amount must be a valid number.';
      }
      return item.message;
    }).join(' ');
  } else if (error.name === 'CastError') {
    status = 400;
    message = `Invalid ${error.path}.`;
  } else if (error.code === 11000) {
    status = 409;
    message = 'A category with that name already exists.';
  } else if (error.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body must contain valid JSON.';
  } else if (status >= 500) {
    message = 'Something went wrong';
    console.error(error.message);
  }

  response.status(status).json({ success: false, message: message || 'Request failed.' });
}


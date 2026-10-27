export class DatabaseUnavailableError extends Error {
  statusCode: number;

  constructor(message = 'Database unavailable: Persistent write operations require an active MongoDB connection.') {
    super(message);
    this.name = 'DatabaseUnavailableError';
    this.statusCode = 503;
    Object.setPrototypeOf(this, DatabaseUnavailableError.prototype);
  }
}

export class ForbiddenError extends Error {
  statusCode: number;

  constructor(message = 'Forbidden: Insufficient permissions.') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class NotFoundError extends Error {
  statusCode: number;

  constructor(message = 'Resource not found.') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class CustomError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'CustomError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends CustomError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = 'No autorizado') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = 'Acceso prohibido') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

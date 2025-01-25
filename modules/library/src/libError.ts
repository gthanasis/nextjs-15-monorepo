import {OperationalError} from 'bluebird'

export class OpError extends OperationalError {
    private code: number;
    private type: string;
    private original: Error | null;

    constructor ({message = 'Generic operational error', code = 500, original = null} = {}) {
        super(message)
        this.message = message
        this.code = code
        this.type = 'operational'
        this.original = original
    }
}

export class NotFoundError extends OpError {
    constructor ({message = 'The requested url could not be found', code = 404, original = null} = {}) {
        super({message, code, original})
    }
}

export class ResourceNotFoundError extends OpError {
    constructor ({message = 'Resource not found', code = 404, original = null} = {}) {
        super({message, code, original})
    }
}

export class UnauthorizedError extends OpError {
    constructor ({message = 'Authentication required', code = 401, original = null} = {}) {
        super({message, code, original})
    }
}

export class ForbiddenError extends OpError {
    constructor ({message = 'You are not authorized to perform this request', code = 403, original = null} = {}) {
        super({message, code, original})
    }
}

export class BadRequestError extends OpError {
    constructor ({message = 'Your request could not be served. Please make sure you provided the correct input.', code = 400, original = null} = {}) {
        super({message, code, original})
    }
}

export class ResourceExistsError extends OpError {
    constructor ({message = 'Resource already exists', code = 409, original = null} = {}) {
        super({message, code, original})
    }
}

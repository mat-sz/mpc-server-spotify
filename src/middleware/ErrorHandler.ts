import { Request, Response } from 'express';
import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';

@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
    error(error: Error, request: Request, response: Response, next: (err: any) => any) {
        if (!error || !error.message) {
            next(null);
            return;
        }

        next(JSON.stringify({
            success: false,
            error: {
                message: error.message,
            }
        }));
    }
}
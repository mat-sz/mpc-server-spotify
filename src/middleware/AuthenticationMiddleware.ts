import { Response } from 'express';
import { ExpressMiddlewareInterface, HttpError } from 'routing-controllers';
import jwt from 'jsonwebtoken';

import { createAuthenticatedSpotify } from '../Spotify';

export class AuthenticationMiddleware implements ExpressMiddlewareInterface {
    async use(request: any, response: Response, next?: (err?: any) => any) {
        if (request.headers['authorization']) {
            const split = request.headers['authorization'].split(' ');
            const token = split[split.length - 1];

            try {
                const data: any = jwt.verify(token, process.env.JWT_SECRET);
                if (data.refreshToken) {
                    request.spotify = await createAuthenticatedSpotify(data.refreshToken);
                }
            } catch {}
        }

        if (!request.spotify) {
            throw new HttpError(401, 'Unauthorized.');
        }

        next();
    }
}
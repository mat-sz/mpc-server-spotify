import { Request, Response } from 'express';
import { Controller, QueryParam, Get, Post, Redirect, Req, Res, BodyParam } from 'routing-controllers';
import uuid from 'uuid/v4';
import jwt from 'jsonwebtoken';

import { createSpotify, createAuthorizeUrl, createAuthenticatedSpotify } from '../Spotify';

interface PendingAuthenticationModel {
    key: string,
    createdAt: Date,
    state: 'incomplete' | 'successful' | 'failed',
    token?: string,
    redirectUri?: string,
};

let pending: PendingAuthenticationModel[] = [];

@Controller()
export class AuthenticationController {
    @Get('/auth')
    index() {
        
    }

    @Post('/auth')
    start(@BodyParam('redirectUri') redirectUri: string) {
        const key = uuid();

        pending.push({
            key: key,
            createdAt: new Date(),
            state: 'incomplete',
            redirectUri,
        });

        return {
            success: true,
            data: {
                key
            }
        };
    }

    @Get('/auth/continue')
    @Redirect('/')
    continue(@QueryParam('key', { required: true }) key: string) {
        return createAuthorizeUrl(key);
    }

    @Get('/auth/callback')
    async callback(@Req() request: Request, @Res() response: Response,
        @QueryParam('state', { required: true }) key: string,
        @QueryParam('code') code: string,
        @QueryParam('error') error: string) {
        const pendingAuth = pending.find((auth) => auth.key == key);

        if (!pendingAuth) throw new Error('Not found.');

        if (error || !code) {
            pendingAuth.state = 'failed';
            
            if (pendingAuth.redirectUri) {
                response.redirect(pendingAuth.redirectUri);
            }
        } else {
            try {
                let spotify = createSpotify();

                const grant = await spotify.authorizationCodeGrant(code);
    
                if (!grant || !grant.body.access_token) {
                    pendingAuth.state = 'failed';
                } else {
                    pendingAuth.state = 'successful';
                    pendingAuth.token = jwt.sign({ refreshToken: grant.body.refresh_token }, process.env.JWT_SECRET);
        
                    const date = new Date();
                    date.setTime(date.getTime() + grant.body.expires_in * 1000);
        
                    // Doing this to make sure the tokens get cached.
                    spotify = await createAuthenticatedSpotify(grant.body.refresh_token, grant.body.access_token, date);
                }
            } catch {
                pendingAuth.state = 'failed';
            }
    
            if (pendingAuth.redirectUri) {
                response.redirect(pendingAuth.redirectUri);
            }
        }

        response.contentType('html');
        return `<script>
        window.close();
        </script>`;
    }

    @Get('/auth/state')
    state(@QueryParam('key', { required: true }) key: string) {
        const pendingAuth = pending.find((auth) => auth.key == key);

        if (!pendingAuth) throw new Error('Not found.');

        let data: any = {
            state: pendingAuth.state,
        };

        if (pendingAuth.state === 'successful' && pendingAuth.token) {
            data.token = pendingAuth.token;
        }
        
        return {
            success: true,
            data,
        };
    }

    @Post('/auth/renew')
    renew() {

    }
}
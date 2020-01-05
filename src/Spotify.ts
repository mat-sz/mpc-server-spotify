import SpotifyWebApi from 'spotify-web-api-node';

interface TokenModel {
    refreshToken: string,
    accessToken: string,
    createdAt: Date,
    expiresAt: Date,
};
 
const scopes = [
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-library-read',
    'user-library-modify',
    'user-top-read',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-read-recently-played',
];

let tokens = new Map<string, TokenModel>();

export const createSpotify = () => new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
});

export const createAuthenticatedSpotify = async (refreshToken: string, accessToken?: string, expiresAt?: Date) => {
    const spotify = createSpotify();
    
    let token = tokens.get(refreshToken);
    if (!token && accessToken && expiresAt) {
        token = {
            refreshToken,
            accessToken,
            expiresAt,
            createdAt: new Date(),
        };
        tokens.set(refreshToken, token);
    } else {
        return null;
    }

    spotify.setAccessToken(token.accessToken);
    spotify.setRefreshToken(token.refreshToken);

    const date = new Date();
    if (date.getTime() > token.expiresAt.getTime()) {
        const refresh = await spotify.refreshAccessToken();
        const newAccessToken = refresh.body.access_token;
        spotify.setAccessToken(newAccessToken);

        token.accessToken = newAccessToken;

        date.setTime(date.getTime() + refresh.body.expires_in * 1000)
        token.expiresAt = date;
    }

    return spotify;
};

export const createAuthorizeUrl = (key: string) => {
    const spotify = createSpotify();
    return spotify.createAuthorizeURL(scopes, key);
};
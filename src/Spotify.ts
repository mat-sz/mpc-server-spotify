import SpotifyWebApi from 'spotify-web-api-node';
 
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

export const createSpotify = () => new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
});

export const createAuthorizeUrl = (key: string) => {
    const spotify = createSpotify();
    return spotify.createAuthorizeURL(scopes, key);
};
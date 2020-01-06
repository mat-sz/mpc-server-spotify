import { Controller, QueryParam, Get, Post, UseBefore, Req } from 'routing-controllers';
import { AuthenticationMiddleware, CustomRequest } from '../middleware/AuthenticationMiddleware';

@Controller()
@UseBefore(AuthenticationMiddleware)
export class PlaybackController {
    @Get('/playback')
    async index(@Req() request: CustomRequest) {
        const spotify = request.spotify;

        const track = await spotify.getMyCurrentPlayingTrack();
        let data: any = {};

        const item = track.body.item;
        
        data.playback = {
            active: track.body.is_playing,
        };

        if (track.body.is_playing) {
            data.playback.progress = track.body.progress_ms;
            data.playback.duration = item.duration_ms;
        }

        data.track = {
            id: item.id,
            name: item.name,
            artistName: item.artists.reduce((string, value, i) =>
                string + (i > 0 ? ", " : "") + value.name
            , ""),
            duration: item.duration_ms,
        };

        data.album = {
            id: item.album.id,
            name: item.album.name,
        };

        if (track.body.context.type === 'playlist') {
            const playlistId = track.body.context.uri.split(':').slice(-1)[0];
            const playlist = await spotify.getPlaylist(playlistId, {
                fields: 'name',
            });

            data.playlist = {
                id: playlistId,
                name: playlist.body.name,
            };
        }

        return {
            success: true,
            data,
        };
    }

    @Post('/playback/next')
    async next(@Req() request: CustomRequest) {
        const spotify = request.spotify;
        await spotify.skipToNext();

        return {
            success: true,
        }
    }

    @Post('/playback/previous')
    async previous(@Req() request: CustomRequest) {
        const spotify = request.spotify;
        await spotify.skipToNext();

        return {
            success: true,
        }
    }
}
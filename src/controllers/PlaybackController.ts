import { Controller, QueryParam, Get, Post } from 'routing-controllers';

@Controller()
export class PlaybackController {
    @Get('/auth')
    index() {
        
    }

    @Post('/auth')
    start() {
        
    }

    @Post('/auth/state')
    state(@QueryParam("key") key: string) {
        
    }

    @Post('/auth/renew')
    renew() {

    }
}
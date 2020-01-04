import 'reflect-metadata';
import { createExpressServer } from 'routing-controllers';

import { AuthenticationController } from './controllers/AuthenticationController';
import { CapabilitiesController } from './controllers/CapabilitiesController';
import { PlaybackController } from './controllers/PlaybackController';
import { ErrorHandler } from './middleware/ErrorHandler';

export default function App() {
    const app = createExpressServer({
        controllers: [
            AuthenticationController,
            CapabilitiesController,
            PlaybackController,
        ],
        middlewares: [ ErrorHandler ],
        defaultErrorHandler: false,
    });
    
    app.listen(process.env.PORT || 3000);
}
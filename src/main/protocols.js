import {protocol} from 'electron';

protocol.registerSchemesAsPrivileged([
    {
        scheme: 'sidekick-extensions',
        privileges: {
            supportFetchAPI: true
        }
    },
    {
        scheme: 'sidekick-library-files',
        privileges: {
            supportFetchAPI: true
        }
    }
]);

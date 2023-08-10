import React from 'react';
import ReactDOM from 'react-dom';
import {ipcRenderer} from 'electron';

import licenseText from '!!raw-loader!../../../LICENSE';
import styles from './about.css';

document.documentElement.lang = 'en';

ipcRenderer.invoke('get-debug-info').then(info => {
    ReactDOM.render((
        <main>
            <h1>Sidekick Desktop v{info.version}</h1>
            <p>
                <i>
                    {'(Debug info: '}
                    {`v${info.version} ${info.env}, `}
                    {`${info.platform} ${info.arch}${info.runningUnderTranslation ? '-translated' : ''}, `}
                    {`Electron ${info.electron}`}
                    {')'}
                </i>
            </p>
            {/* !!! CHANGE !!! */}
            {/* <p>Sidekick is a mod of Scratch with a compiler and more features. Sidekick is not affiliated with Scratch, the Scratch Team, or the Scratch Foundation. Learn more at <a
                href="https://mixality.github.io/Sidekick/desktop"
                target="_blank"
                rel="noreferrer"
            >https://mixality.github.io/Sidekick/desktop</a>.</p> */}
            <p>Sidekick is a mod of Scratch with a compiler and more features. Sidekick is not affiliated with Scratch, the Scratch Team, or the Scratch Foundation. Learn more at <a
                href="https://menersar.github.io/Sidekick/desktop"
                target="_blank"
                rel="noreferrer"
            >https://menersar.github.io/Sidekick/desktop</a>.</p>
            {/* !!! CHANGE !!! */}
            {/* !!!!!HERE!!!!! */}
            {/* !!! 'BSD-iwas Lizens'? !!! */}
            {/* <p>Sidekick Desktop is licensed under the GNU General Public License v3.0. The source code is published <a
                href="https://github.com/Mixality/Sidekick/"
                target="_blank"
                rel="noreferrer"
            >on GitHub</a>. You can read the license below:</p> */}
            <p>Sidekick Desktop is licensed under the GNU General Public License v3.0. The source code is published <a
                href="https://github.com/Menersar/Sidekick/"
                target="_blank"
                rel="noreferrer"
            >on GitHub</a>. You can read the license below:</p>
            <pre>{licenseText}</pre>
        </main>
    ), require('../app-target'));
});

import React from 'react';
import ReactDOM from 'react-dom';
import AddonSettings from 'scratch-gui/src/addons/settings/settings.jsx';
import '../prompt/prompt.js';

const handleExportSettings = (settings) => {
  AddonsPreload.exportSettings(JSON.stringify(settings));
};

const appTarget = document.getElementById('app');
document.body.classList.add('sidekick-loaded');

ReactDOM.render((
  <AddonSettings
    onExportSettings={handleExportSettings}
  />
), appTarget);

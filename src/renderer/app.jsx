import React from 'react';
import {compose} from 'redux';

import GUI from 'scratch-gui/src/index';
import AppStateHOC from 'scratch-gui/src/lib/app-state-hoc.jsx';

import SidekickDesktopAppStateHOC from './ScratchDesktopAppStateHOC.jsx';
import SidekickDesktopGUIHOC from './ScratchDesktopGUIHOC.jsx';
import styles from './app.css';

const appTarget = document.getElementById('app');
appTarget.className = styles.app || 'app';

GUI.setAppElement(appTarget);

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedGui = compose(
    SidekickDesktopAppStateHOC,
    AppStateHOC,
    SidekickDesktopGUIHOC
)(GUI);

export default <WrappedGui />;

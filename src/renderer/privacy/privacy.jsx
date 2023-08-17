import React from "react";
import ReactDOM from "react-dom";
import { ipcRenderer } from "electron";

// !!! ''styles' is declared but its value is never read. ts(6133)'? ???
import styles from "./privacy.css";

document.documentElement.lang = "en";

const openDesktopSettings = (e) => {
  e.preventDefault();
  ipcRenderer.send("open-desktop-settings");
};

const canUpdatesBeEnabled = ipcRenderer.sendSync(
  "update-checker/can-be-enabled"
);

ReactDOM.render(
  // Please make sure privacy.html is always the same as this.
  <main>
    <h1>Privacy Policy</h1>
    <p>
      <i>Updated August 17th, 2023</i>
    </p>

    {canUpdatesBeEnabled ? (
      <p>
        The app may make requests to check for updates. These requests are not
        logged. These requests{" "}
        <a onClick={openDesktopSettings}>can be disabled</a>.
      </p>
    ) : (
      <p>The builtin update checker is disabled in this build of the app.</p>
    )}
    <p>
      Scratch extensions that require Wi-Fi (such as Translate, Text to Speech,
      LEGO, micro:bit, etc.) may connect to the Scratch API to implement these
      features.{" "}
      <a
        href="https://scratch.mit.edu/privacy_policy/"
        target="_blank"
        // !!! Change back to the following code line? ???
        // rel="noreferrer"
      >
        Refer to the Scratch privacy policy for more information
      </a>
      . The Translate extension may instead make requests to a TurboWarp API,
      which may then forward your request to the Scratch API and log the message
      being translated and the result for caching and performance.
    </p>

    <h2>Packager</h2>
    <p>
      The packager may contact the Scratch API to download projects. See the{" "}
      <a href="https://scratch.mit.edu/privacy_policy/">
        Scratch privacy policy
      </a>{" "}
      for more information. If you configure the packager to package a project
      from a remote URL, you are subject to the privacy practices of that
      particular website. The packager may download large files such as Electron
      binaries from a remote server; these requests are not logged.
    </p>

    {/* !!! '`"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`. eslint (react/no-unescaped-entities)'? ??? */}
    <h2>Output of packager ("packaged projects")</h2>
    {/* !!! CHANGE !!! */}
    {/* Keep in sync with https://mixality.github.io/Sidekick/sidekick-packager/privacy.html */}
    {/* Keep in sync with https://menersar.github.io/Sidekick/sidekick-packager/privacy.html */}
    <p>
      If the packaged project uses extensions that require Wi-Fi such as
      Translate, Text to Speech, LEGO, and micro:bit, then the project may
      connect to the Scratch API to implement these features.{" "}
      <a href="https://scratch.mit.edu/privacy_policy/">
        Refer to the Scratch privacy policy for more information
      </a>
      .
    </p>
    {/* !!! CHANGE !!! */}
    {/* <p>If the packaged project uses the Translate extension or is configured to "Connect to cloud variable server", then the project may connect to servers controlled by Sidekick. The project ID and username may be logged. <a href="https://mixality.github.io/Sidekick/privacy.html">Refer to the primary Sidekick privacy policy for more information</a>.</p> */}
    <p>
      If the packaged project uses the Translate extension or is configured to
      "Connect to cloud variable server", then the project may connect to
      servers controlled by TurboWarp. The project ID and username may be
      logged.{" "}
      <a href="https://menersar.github.io/Sidekick/privacy.html">
        Refer to the primary Sidekick privacy policy for more information
      </a>
      .
    </p>
    <p>
      If the packaged project uses custom extensions, custom JS, or custom cloud
      host, contact the relevant maintainer for their privacy practices.
    </p>
    <p>
      You are responsible for informing end users about the privacy practices of
      the files you distribute. Do not link to this document as your project's
      privacy policy as it may change in the future; you should write your own
      using this section as a reference.
    </p>

    <h2>Contact</h2>
    {/* !!! CHANGE !!! */}
    {/* !!!!!HERE!!!!! */}
    {/* <p>Any concerns related to privacy or any other matter should be sent to: <a href="https://github.com/Menersar/Sidekick/issues">https://github.com/Menersar/Sidekick/issues</a></p> */}
    {/* <p>Any concerns related to privacy or any other matter should be sent to: <a href="https://github.com/Mixality/Sidekick/issues">https://github.com/Menersar/Sidekick/issues</a></p> */}
    {/* <p>Any concerns related to privacy or any other matter should be sent to: <a href="https://github.com/Menersar/sidekick-desktop/issues">https://github.com/Menersar/Sidekick/issues</a></p> */}
    {/* <p>Any concerns related to privacy or any other matter should be sent to: <a href="https://github.com/Mixality/sidekick-desktop/issues">https://github.com/Menersar/Sidekick/issues</a></p> */}
    {/* <p>Any concerns related to privacy or any other matter should be sent to: <a href="mailto:contact@sidekick.org">contact@mixality.org</a></p> */}
    <p>
      Any concerns related to privacy or any other matter should be sent to:{" "}
      {/* <a href="mailto:contact@mixality.de">contact@mixality.de</a> */}
    </p>
  </main>,
  require("../app-target")
);

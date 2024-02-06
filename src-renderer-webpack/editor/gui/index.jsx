import React from "react";
import ReactDOM from "react-dom";
import GUI from "./gui.jsx";

import "./filesystem-api-impl.js";
import "./media-device-chooser-impl.js";
import "../prompt/prompt.js";

// if (process.platform === "linux") {
// import("../static/gpiolib.node");
// }

const appTarget = document.getElementById("app");
document.body.classList.add("sidekick-loaded");
GUI.setAppElement(appTarget);

ReactDOM.render(<GUI />, appTarget);

require("./addons");
// require("./static");
require("./static/gpiolib.node");

EditorPreload.getAdvancedCustomizations().then(({ userscript, userstyle, modulescript }) => {
  if (userstyle) {
    const style = document.createElement("style");
    style.textContent = userstyle;
    document.body.appendChild(style);
  }

  if (userscript) {
    const script = document.createElement("script");
    script.textContent = userscript;
    document.body.appendChild(script);
  }

  if (modulescript) {
    const script = document.createElement("script");
    script.textContent = modulescript;
    script.type = "module";
    document.body.appendChild(script);
  }
});

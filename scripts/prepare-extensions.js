const pathUtil = require("path");

let Builder;
try {
  Builder = require("../extensions/development/builder");
} catch (e) {
  if (e.code === "MODULE_NOT_FOUND") {
    console.error(
      "Could not load sidekick-desktop/extensions build scripts – perhaps the sidekick-extensions submodule is missing?"
    );
    console.error(
      "If the extension submodule is missing, run: `git submodule init`, `git submodule update`."
    );
  } else {
    console.error(e);
  }
  process.exit(1);
}

const outputDirectory = pathUtil.join(
  __dirname,
  "..",
  "static",
  "sidekick-extensions.mixality.de"
);
const mode = "sidekick-desktop";
const builder = new Builder(mode);
const build = builder.build();
build.export(outputDirectory);

// !!! CHANGE !!!
// console.log(`Built ${mode} copy of extensions.turbowarp.org to ${outputDirectory}`);
// console.log(`Built ${mode} copy of menersar.github.io/Sidekick/extensions to ${outputDirectory}`);
// console.log(`Built ${mode} copy of sidekick-extensions to ${outputDirectory}`);
console.log(
  `Built ${mode} copy of sidekick-extensions.mixality.de to ${outputDirectory}`
);

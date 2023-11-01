const pathUtil = require("path");

let Builder;
try {
  Builder = require("../sidekick-extensions/development/builder");
} catch (e) {
//   if (e.code === "MODULE_NOT_FOUND") {
//     console.error(
//       "Could not load sidekick-desktop/sidekick-extensions build scripts – perhaps the sidekick-extensions submodule is missing?"
//     );
//     console.error(
//       "If the extension submodule is missing, run: `git submodule init`, `git submodule update`."
//     );
//   } else {
  console.error(
    "Could not load sidekick-extensions build scripts, most likely because the submodule is missing."
  );
  console.error("Try running: `git submodule init` and `git submodule update`");
  console.error(e);
//   }
  process.exit(1);
}

const outputDirectory = pathUtil.join(__dirname, "../dist-extensions/");

const mode = "desktop";
const builder = new Builder(mode);
const build = builder.build();
build.export(outputDirectory);

// !!! CHANGE !!!
// console.log(`Built ${mode} copy of extensions.turbowarp.org to ${outputDirectory}`);
// console.log(`Built ${mode} copy of menersar.github.io/sidekick-extensions to ${outputDirectory}`);
// console.log(`Built ${mode} copy of sidekick-extensions to ${outputDirectory}`);
console.log(
  `Built ${mode} copy of sidekick-extensions.mixality.de to ${outputDirectory}`
);

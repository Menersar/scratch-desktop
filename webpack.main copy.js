const merge = require("webpack-merge");
const DefinePlugin = require("webpack").DefinePlugin;

// const path = require('path');

// const makeConfig = require('./webpack.makeConfig.js');

module.exports = (defaultConfig) => {
  return merge.smart(defaultConfig, {
    plugins: [
      new DefinePlugin({
        "process.env.SIDEKICK_ENABLE_UPDATE_CHECKER": JSON.stringify(
          process.env.TW_ENABLE_UPDATE_CHECKER
        ),
      }),
    ],
  });
};

// makeConfig(
//     defaultConfig,
//     {
//         name: 'main',
//         useReact: false,
//         disableDefaultRulesForExtensions: ['js'],
//         babelPaths: [
//             path.resolve(__dirname, 'src', 'main')
//         ]
//     }
// );

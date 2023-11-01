// const path = require("path");

// const CopyWebpackPlugin = require("copy-webpack-plugin");

// // const makeConfig = require('./webpack.makeConfig.js');

// const merge = require("webpack-merge");

// // const getModulePath = moduleName => path.dirname(require.resolve(`${moduleName}/package.json`));

// module.exports = (defaultConfig) => {
//   defaultConfig.module.rules = [];
//   return merge.smart(defaultConfig, {
//     devtool: "",
//     module: {
//       rules: [
//         {
//           test: /\.jsx?$/,
//           loader: "babel-loader",
//           options: {
//             presets: ["@babel/preset-env", "@babel/preset-react"],
//             // !!!!!HERE!!!!!
//             plugins: ["@babel/plugin-proposal-optional-chaining"],
//             // plugins: ['@babel/plugin-transform-optional-chaining']
//           },
//         },
//         {
//           test: /\.(svg|png|wav|gif|jpg|mp3|ttf|otf)$/,
//           loader: "file-loader",
//           options: {
//             outputPath: "static/assets/",
//             esModule: false,
//           },
//         },
//         {
//           test: /\.css$/,
//           use: [
//             {
//               loader: "style-loader",
//             },
//             {
//               loader: "css-loader",
//               options: {
//                 importLoaders: 1,
//                 modules: {
//                   localIdentName: "[name]_[local]_[hash:base64:5]",
//                   exportLocalsConvention: "camelCase",
//                 },
//               },
//             },
//             {
//               loader: "postcss-loader",
//               options: {
//                 postcssOptions: {
//                   plugins: ["postcss-import", "postcss-simple-vars"],
//                 },
//               },
//             },
//           ],
//         },
//       ],
//     },
//     plugins: [
//       new CopyWebpackPlugin({
//         patterns: [
//           {
//             from: "node_modules/scratch-blocks/media",
//             to: "static/blocks-media",
//           },
//         ],
//       }),
//     ],
//     resolve: {
//       alias: {
//         "scratch-gui$": path.resolve(
//           __dirname,
//           "node_modules",
//           "scratch-gui",
//           "src",
//           "index.js"
//         ),
//         "scratch-render-fonts$": path.resolve(
//           __dirname,
//           "node_modules",
//           "scratch-gui",
//           "src",
//           "lib",
//           "sidekick-scratch-render-fonts"
//         ),
//       },
//     },
//     output: {
//       libraryTarget: "var",
//     },
//     target: "web",
//   });
// };

// // makeConfig(
// //     defaultConfig,
// //     {
// //         name: 'renderer',
// //         useReact: true,
// //         disableDefaultRulesForExtensions: ['js', 'jsx', 'css', 'svg', 'png', 'wav', 'gif', 'jpg', 'ttf'],
// //         babelPaths: [
// //             path.resolve(__dirname, 'src', 'renderer'),
// //             /node_modules[\\/]+scratch-[^\\/]+[\\/]+src/,
// //             /node_modules[\\/]+pify/,
// //             /node_modules[\\/]+@vernier[\\/]+godirect/
// //         ],
// //         plugins: [
// //             new CopyWebpackPlugin([{
// //                 from: path.join(getModulePath('scratch-blocks'), 'media'),
// //                 to: 'static/blocks-media'
// //             }]),
// //             new CopyWebpackPlugin([{
// //                 from: 'extension-worker.{js,js.map}',
// //                 context: path.join(getModulePath('scratch-vm'), 'dist', 'web')
// //             }]),
// //             new CopyWebpackPlugin([{
// //                 from: path.join(getModulePath('scratch-gui'), 'src', 'lib', 'libraries', '*.json'),
// //                 to: 'static/libraries',
// //                 flatten: true
// //             }])
// //         ]
// //     }
// // );

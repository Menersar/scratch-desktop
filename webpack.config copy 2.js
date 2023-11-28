const path = require("path");
const { DefinePlugin } = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const base = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  devtool: "",
  target: "web",
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
        },
      },
      {
        test: /\.(svg|png|wav|gif|jpg|mp3|ttf|otf)$/,
        loader: "file-loader",
        options: {
          outputPath: "static/assets/",
          esModule: false,
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: "[name]_[local]_[hash:base64:5]",
              camelCase: true,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  "postcss-import",
                  "postcss-simple-vars",
                  "autoprefixer",
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.node$/,
        loader: "node-loader",
        // include: path.resolve(__dirname, 'src')
        options: {
          outputPath: "static/",
        },
      },
    ],
  },
  //   plugins: [
  //     new CopyWebpackPlugin([
  //       {
  //         from: "src-main/static",
  //         to: "static",
  //       },
  //     ]),
  //   ],

  //   plugins: [
  //     new DefinePlugin({
  //       "process.env.ROOT": '""',
  //     }),
  //     new CopyWebpackPlugin({
  //       patterns: [
  //         {
  //           from: "src-main/static",
  //           to: "static",
  //         },
  //         {
  //           context: "src-main/static/",
  //           from: "*.node",
  //         },
  //       ],
  //     }),
  //   ],
};

module.exports = [
  {
    ...base,
    output: {
      path: path.resolve(__dirname, "dist-renderer-webpack/editor/gui"),
      filename: "index.js",
    },
    entry: "./src-renderer-webpack/editor/gui/index.jsx",
    plugins: [
      new DefinePlugin({
        "process.env.ROOT": '""',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "node_modules/scratch-blocks/media",
            to: "static/blocks-media",
          },
          {
            context: "src-renderer-webpack/editor/gui/",
            from: "*.html",
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        "scratch-gui$": path.resolve(
          __dirname,
          "node_modules/scratch-gui/src/index.js"
        ),
        "scratch-render-fonts$": path.resolve(
          __dirname,
          "node_modules/scratch-gui/src/lib/sidekick-scratch-render-fonts"
        ),
      },
    },
  },

  {
    ...base,
    output: {
      path: path.resolve(__dirname, "dist-renderer-webpack/editor/addons"),
      filename: "index.js",
    },
    entry: "./src-renderer-webpack/editor/addons/index.jsx",
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            context: "src-renderer-webpack/editor/addons/",
            from: "*.html",
          },
        ],
      }),
    ],
  },
  //   {
  //     ...base,
  //     output: {
  //       path: path.resolve(__dirname, "../static"),
  //       filename: "gpiolib.node",
  //     },
  //     entry:
  //       "./node_modules/scratch-vm/src/extensions/scratch3_pigpio/index.js",
  //     plugins: [
  //       new CopyWebpackPlugin({
  //         patterns: [
  //           {
  //             from: "node_modules/scratch-gui/build/static",
  //             to: "static",
  //           },
  //         ],
  //       }),
  //     ],
  //   },
];

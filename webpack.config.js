const path = require("path");
const { DefinePlugin } = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const base = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  devtool: "",
  // target: "web",
  target: "web",
  node: {
    __dirname: false,
  },
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
      // https://yorkyu.cn/scratch-example-build-cra-blocks-vm-14f14897be6a.html
      // https://cloud.tencent.com/developer/article/1961091
      // {
      //   test: /\.(vert|frag)$/i,
      //   use: {
      //     loader: './loader/vert-frag-loader.js', // 关键loader配置，后续文章解释
      //   },
      // },
      // ,
      {
        test: /\.node$/,
        loader: "file-loader",
        // include: path.resolve(__dirname, 'src')
        options: {
          outputPath: "static/",
          // Emit file from the context directory into the output directory retaining the full directory structure:
          // (https://v4.webpack.js.org/loaders/file-loader/)
          // name: "[path][name].[ext]",
          name: "[name].[ext]",
          // esModule: false,
        },
      },
    ],
  },
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
            from: "node_modules/scratch-vm/src/static",
            to: "static/",
          },
          {
            context: "src-renderer-webpack/editor/gui/",
            from: "*.html",
          },
        ],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "node_modules/scratch-vm/src/static",
            to: "static/",
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
            from: "node_modules/scratch-vm/src/static",
            to: "static/",
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

  // {
  //   ...base,
  //   target: "node",
  //   node: {
  //     __dirname: false,
  //   },
  //   module: {
  //     rules: [
  //       {
  //         // output: {
  //         //   path: path.resolve(__dirname, "dist-renderer-webpack/editor/addons"),
  //         //   filename: "index.js",
  //         // },
  //         // entry: "./src-renderer-webpack/editor/addons/index.jsx",
  //         // plugins: [
  //         //   new CopyWebpackPlugin({
  //         //     patterns: [
  //         //       {
  //         //         context: "src-renderer-webpack/editor/addons/",
  //         //         from: "*.html",
  //         //       },
  //         //     ],
  //         //   }),
  //         // ],

  //         test: /\.node$/,
  //         loader: "node-loader",
  //         // include: path.resolve(__dirname, 'src')
  //         // options: {
  //         //   outputPath: "static/",
  //         // },
  //       },
  //     ],
  //   },
  // },
];

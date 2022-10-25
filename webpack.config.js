const path = require("path");
const fs = require("fs");
require("dotenv").config();

const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const { ProvidePlugin, DefinePlugin } = require("webpack");

const isDevelopment = process.env.NODE_ENV !== "production";

module.exports = {
  mode: isDevelopment ? "development" : "production",
  devServer: {
    port: 3000,
    client: { overlay: false },
  },
  entry: {
    main: "./src/index.tsx",
  },
  module: {
    rules: [
      {
        test: /\.(ts)x?$/,
        exclude: /node_modules\/(?!(melonjs)\/).*/,
        use: "babel-loader",
      },
    ],
  },
  plugins: [
    isDevelopment && new ReactRefreshPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: "./index.html",
      template: "./src/index.html",
      hash: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./src/game/data",
          to: "./data",
          filter: async (resourcePath) => {
            const data = await fs.promises.readFile(resourcePath);

            // add your custom extension here if not listed
            var texture = /\.(jpe?g|gif|png|svg|heic|pkm|pvr)$/;
            var fnt = /\.(woff|woff2|ttf|fnt)$/;
            var map = /\.(tmx|tsx)$/;
            var audio =
              /\.(wav|mp3|mpeg|opus|ogg|oga|wav|aac|caf|m4a|m4b|mp4|weba|webm|dolby|flac)$/;
            var misc = /\.(xml|bin|glsl|ym|json|js|md)$/;

            // only copy production files
            var ret =
              texture.test(resourcePath) ||
              fnt.test(resourcePath) ||
              map.test(resourcePath) ||
              audio.test(resourcePath) ||
              misc.test(resourcePath);

            if (ret === false) {
              console.log("ignoring data: " + resourcePath);
            }
            return ret;
          },
        },
      ],
    }),
    new NodePolyfillPlugin({ excludeAliases: ["process"] }),
    new ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new DefinePlugin({
      "process.env": JSON.stringify(process.env),
      "process.release.name": "your-mum",
    }),
  ].filter(Boolean),
  resolve: {
    // modules: [path.resolve('./src'), path.resolve('./node_modules')],
    extensions: [".tsx", ".ts", ".js", "..."],
    fallback: {
      util: require.resolve(`util/`),
      url: require.resolve(`url/`),
      assert: require.resolve(`assert/`),
      tls: require.resolve("tls-browserify"),
      net: require.resolve("net-browserify"),
      async_hooks: false,
      path: false,
      fs: false,
    },
    symlinks: false,
  },
  target: "web",
  devtool: "inline-source-map",
  externals: {
    bufferutil: "commonjs bufferutil",
    "utf-8-validate": "commonjs utf-8-validate",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
};

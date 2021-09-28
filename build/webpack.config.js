const { Command } = require("commander");
const program = new Command();
program.option("--mode <type>", "mode");
program.option("--watch", "watch");
// program.parse();

program.parse(process.argv);

const options = program.opts();

const MODE = options.watch ? "development" : options.mode;
const PATH = require("./_setting/config.js");
const path = require("path");
const enabledSourceMap = MODE == "development";
const webpack = require("webpack");

const babeloptions =
  MODE == "development"
    ? {
        presets: [["@babel/preset-env", { modules: false }]],
        plugins: ["@babel/plugin-transform-async-to-generator"],
      }
    : {
        presets: [
          ["minify", { builtIns: false, evaluate: false, mangle: false }],
        ],
        plugins: [
          "transform-remove-console",
          "@babel/plugin-transform-async-to-generator",
        ],
      };
module.exports = {
  mode: MODE,
  entry: {
    bundle: ["@babel/polyfill", PATH.src.js + "src/Main.js"],
    worker: PATH.src.js + "src/Worker.js",
  },
  devtool: enabledSourceMap ? "inline-source-map" : false,
  output: {
    path:
      MODE == "production"
        ? path.resolve(PATH.production.js)
        : path.resolve(PATH.dist.js),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.(es6|js)$/,
        use: [
          {
            loader: "babel-loader",
            options: babeloptions,
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(glsl|frag|vert|vs|fs)$/,
        exclude: /node_modules/,
        loader: "glslify-import-loader",
      },
      { test: /\.(glsl|frag|vert|vs|fs)$/, loader: "raw-loader" },
      { test: /\.(glsl|frag|vert|vs|fs)$/, loader: "glslify-loader" },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      jQuery: "jquery",
      $: "jquery-with-plugins",
      Stats: "stats-js",
    }),
  ],
  resolve: {
    modules: [
      path.resolve(__dirname, "./"),
      path.join(path.resolve(""), "node_modules"),
      path.join(path.resolve(""), "./node_modules"),
    ],
    alias: {
      "@": path.resolve(__dirname, PATH.src.js + "/src"),
      "@BALANCeLibs": path.resolve(__dirname, PATH.src.js + "/BALANCeLibs"),
    },
    extensions: [".js", ".json", ".wasm", ".es6"],
  },
};

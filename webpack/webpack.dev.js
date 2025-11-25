const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  devtool: "inline-source-map",
  mode: "development",
  plugins: [
    new LiveReloadPlugin({
      appendScriptTag: true,
      protocol: "http",
      hostname: "localhost",
    }),
  ],
});

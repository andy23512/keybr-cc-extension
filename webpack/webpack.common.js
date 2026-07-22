const path = require("path");
const { createCommonConfig } = require("cc-extension-core/webpack");

module.exports = createCommonConfig({
  extensionRoot: path.join(__dirname, ".."),
});

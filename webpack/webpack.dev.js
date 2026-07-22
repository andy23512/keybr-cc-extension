const path = require("path");
const { createDevConfig } = require("cc-extension-core/webpack");

module.exports = createDevConfig({
  extensionRoot: path.join(__dirname, ".."),
});

const path = require("path");
const { createProdConfig } = require("cc-extension-core/webpack");

module.exports = createProdConfig({
  extensionRoot: path.join(__dirname, ".."),
});

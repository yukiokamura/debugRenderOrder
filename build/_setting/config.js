// _config
var PROJECT_ROOT = "../";

var BUILD = "build/";
var SRC = "src/";
var DIST = "docs/";
var PRODUCTION = "production/";
var DOCS = "docs/";

var SRCPATH = {
  root: PROJECT_ROOT + SRC,
  ejs: PROJECT_ROOT + SRC + "ejs/",
  css: PROJECT_ROOT + SRC + "css/",
  js: PROJECT_ROOT + SRC + "js/",
};

var DISTPATH = {
  root: PROJECT_ROOT + DIST,
  css: PROJECT_ROOT + DIST + "assets/css/",
  js: PROJECT_ROOT + DIST + "assets/js/",
  resource: PROJECT_ROOT + DIST + "assets/resource/",
};

var PRODUCTIONPATH = {
  root: PROJECT_ROOT + PRODUCTION,
  css: PROJECT_ROOT + PRODUCTION + "assets/css/",
  js: PROJECT_ROOT + PRODUCTION + "assets/js/",
  resource: PROJECT_ROOT + PRODUCTION + "assets/resource/",
};

var OTHERPATH = {
  gulp: PROJECT_ROOT + BUILD + "gulp/",
  webpack: PROJECT_ROOT + BUILD + "webpack/",
  styleguide: PROJECT_ROOT + DOCS + "styleguide/",
  jsDoc: PROJECT_ROOT + DOCS + "jsDoc/",
};

var PATH = {
  root: PROJECT_ROOT,
  src: SRCPATH,
  dist: DISTPATH,
  production: PRODUCTIONPATH,
  other: OTHERPATH,
};

module.exports = PATH;

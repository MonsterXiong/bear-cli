"use strict";

const path = require("path");

const log = require("@bear-cli/log");
const Package = require("@bear-cli/package");

const SETTINGS = {
  init: "@bear-cli/init",
  publish: "@bear-cli/publish",
};

const CACHE_DIR = "dependencies";

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storeDir = "";
  let pkg;
  log.verbose("targetPath", targetPath);
  log.verbose("homePath", homePath);

  const cmdName = arguments[arguments.length - 1].name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = "latest";
  log.verbose("packageName", packageName);
  log.verbose("packageVersion", packageVersion);

  if (!targetPath) {
    // 没有指定调试文件路径，则
    targetPath = path.resolve(homePath, CACHE_DIR);
    storeDir = path.resolve(targetPath, "node_modules");
    log.verbose("targetPath", targetPath);
    log.verbose("storeDir", storeDir);
    try {
      pkg = new Package({ targetPath, storeDir, packageName, packageVersion });
      console.log("pkg", pkg);
    } catch (e) {
      log.error(e.message);
    }
  }
}

module.exports = exec;

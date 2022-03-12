"use strict";

const path = require("path");

const log = require("@bear-cli/log");
const Package = require("@bear-cli/package");
const { exec: spawn } = require("@bear-cli/utils");
// const formatPath = require("@bear-cli/format-path");
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
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj._name;
  const packageName = SETTINGS[cmdName];
  const packageVersion = "latest";
  log.verbose("packageName", packageName);
  log.verbose("packageVersion", packageVersion);

  if (!targetPath) {
    // 没有指定调试文件路径
    targetPath = path.resolve(homePath, CACHE_DIR);
    storeDir = path.resolve(targetPath, "node_modules");
    log.verbose("targetPath", targetPath);
    log.verbose("storeDir", storeDir);

    try {
      pkg = new Package({ targetPath, storeDir, packageName, packageVersion });
      if (await pkg.exists()) {
        // 更新package
        await pkg.update();
      } else {
        // 安装package
        await pkg.install();
      }
    } catch (e) {
      log.error(e.message);
    }
  } else {
    pkg = new Package({ targetPath, packageName, packageVersion });
  }
  // const rootFile = pkg.getRootFilePath();
  // const rootFile = formatPath(
  //   path.resolve(__dirname, "../../../commands/init/lib/index.js")
  // );
  // console.log(rootFile);
  // const rootFile = "../../../commands/init/lib/index.js";
  const rootFile = pkg.getRootFilePath();

  if (rootFile) {
    try {
      // 在当前进程中调用
      // require(rootFile).call(null, Array.from(arguments));
      // 在node子进程中调用
      const args = Array.from(arguments);
      const cmd = args[args.length - 1];
      const o = Object.create(null);
      Object.keys(cmd).forEach((key) => {
        if (
          cmd.hasOwnProperty(key) &&
          !key.startsWith("_") &&
          key !== "parent"
        ) {
          o[key] = cmd[key];
        }
      });

      args[args.length - 1] = o;
      const code = `require('${rootFile}').call(null, ${JSON.stringify(
        args[0]
      )})`;
      console.log(code);
      const child = spawn("node", ["-e", code], {
        cwd: process.cwd(),
        stdio: "inherit",
      });
      child.on("error", (e) => {
        log.error(e.message);
        process.exit(1);
      });
      child.on("exit", (e) => {
        log.verbose("命令执行成功:" + e);
        process.exit(e);
      });
    } catch (e) {
      log.error(e.message);
    }
  }
}

module.exports = exec;

"use strict";

const path = require("path");

const log = require("@bear-cli/log");
const pkg = require("../package.json");
const userHome = require("user-home");
const pathExists = require("path-exists").sync;
const chalk = require("chalk");
const semver = require("semver");

const constant = require("./constant");

const error = chalk.red;

module.exports = core;

async function core() {
  try {
    // 初始化检查
    await prepare();
    // 注册命令
    registerCommand();
  } catch (e) {
    log.error(e.message);
  }
}

function registerCommand() {
  console.log("注册命令开始");
}

async function prepare() {
  // 检查脚手架版本
  checkPkgVersion();
  // 检查Root权限并降级
  checkRoot();
  // 检查用户主目录
  checkUserHome();
  // 检查是否配置文件
  checkEnv();
  // 检查是否愮更新
  await checkGlobalUpdate();
}
async function checkGlobalUpdate() {
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  const { getNpmLatestVersion } = require("@bear-cli/get-npm-info");
  const lastVersion = await getNpmLatestVersion(npmName);
  console.log(lastVersion);
  log.info(`${lastVersion}----最新版本`);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      chalk.yellow(`请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本：${lastVersion}
                更新命令： npm install -g ${npmName}`)
    );
  }
}

function checkEnv() {
  const dotenv = require("dotenv");
  const dotenvPath = path.resolve(userHome, ".env");
  if (pathExists(dotenvPath)) {
    dotenv.config({
      path: dotenvPath,
    });
  }
  createDefaultConfig();
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConfig["cliHome"] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig["cliHome"] = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }

  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(error("当前登录用户主目录不存在！！！"));
  }
}

function checkRoot() {
  require("root-check")();
}

function checkPkgVersion() {
  log.info("cli", pkg.version);
}

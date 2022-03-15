"use strict";

const path = require("path");

const log = require("@bear-cli/log");
const exec = require("@bear-cli/exec");
const pkg = require("../package.json");
const userHome = require("os").homedir();
const pathExists = require("path-exists").sync;
const chalk = require("chalk");
const semver = require("semver");
const terminalLink = require("terminal-link");
const { Command } = require("commander");
const program = new Command();
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
    if (program.opts().debug) {
      console.log(e);
    }
  }
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .option("-v,--version", "查看版本号", pkg.version)
    .option("-d, --debug", "打开调试模式", false)
    .option("-tp, --targetPath <value>", "指定本地调试文件路径")
    .option("-h, --help", "帮助文档");

  program
    .command("author")
    .description("作者信息")
    .action(async (source, destination) => {
      log.success("欢迎使用Bear脚手架");
      log.success("作者博客", "1123");
      log.success("Github", "https://github.com/MonsterXiong");
      log.success("作者介绍", "Monster Bear");
    });

  program
    .command("docs")
    .description("查看文档")
    .option("-t,--type", "指定类型")
    .action(() => {
      console.log("查看文档");
    });

  program
    .command("init [projectName]")
    .description("项目初始化")
    .option("-f,--force", "是否强制初始化项目")
    .action(exec);

  program
    .command("add <command> <name>")
    .description("添加内容")
    .option("--path", "文件放置路径", "./")
    .action(() => {
      console.log("添加内容");
    });

  program
    .command("publish")
    .description("项目发布")
    .option("--refreshServer", "强制更新远程Git仓库")
    .option("--refreshToken", "强制更新远程仓库token")
    .option("--refreshOwner", "强制更新远程仓库类型")
    .action(() => {
      console.log("项目发布");
    });

  program
    .command("clean")
    .description("清除缓存文件")
    .action(() => {
      console.log("清除缓存文件");
    });

  program
    .command("help")
    .description("帮助文档")
    .action(() => {
      console.log();
      console.log("打开帮助文档");
    });

  // 开启debug模式
  program.on("option:debug", function (obj) {
    if (program.opts().debug) {
      process.env.LOG_LEVEL = "verbose";
    } else {
      process.env.LOG_LEVEL = "info";
    }
    log.level = process.env.LOG_LEVEL;
  });

  // 指定targetPath
  program.on("option:targetPath", function () {
    process.env.CLI_TARGET_PATH = program.opts().targetPath;
  });

  // 对未知命令监听
  program.on("command:*", function (obj) {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    console.log(chalk.red("未知的命令：" + obj[0]));
    if (availableCommands.length > 0) {
      console.log(chalk.green("可用命令有：" + availableCommands.join(",")));
    }
  });

  program.parse(process.argv);

  if (program.args && program.args.length < 1) {
    program.outputHelp();
  }
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
  log.notice("cli", pkg.version);
}

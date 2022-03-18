"use strict";

const path = require("path");
const fs = require("fs");

const chalk = require("chalk");
const fse = require("fs-extra");
const Listr = require("listr");

const Command = require("@bear-cli/command");
const Git = require("@bear-cli/git");
const log = require("@bear-cli/log");

class PublishCommand extends Command {
  init() {
    // 拿到参数
    // log.verbose("publish", this._argv[0]);
    this.options = {
      refreshServer: this._argv[0].refreshServer,
      refreshToken: this._argv[0].refreshToken,
      refreshOwner: this._argv[0].refreshOwner,
    };
  }
  async exec() {
    try {
      const startTime = new Date().getTime();
      // 1.初始化检查
      this.prepare();
      // Git Flow自动化
      const git = new Git(this.projectInfo, this.options);
      console.log();
      log.info(
        chalk.white("========"),
        chalk.hex("#DEADED").bold("git配置检查"),
        chalk.white("========")
      );
      await git.prepare(); // 自动化提交准备和代码仓库初始化
      console.log();
      log.info(
        chalk.white("========"),
        chalk.hex("#DEADED").bold("git自动提交"),
        chalk.white("========")
      );
      await git.commit(); // 代码自动化提交
      console.log();
      log.info(
        chalk.white("========"),
        chalk.hex("#DEADED").bold("云构建+云发布"),
        chalk.white("========")
      );
      //   3. 云构建和云发布~~
      await git.publish();
      const endTime = new Date().getTime();
      log.verbose(
        "elapsed time",
        new Date(startTime).toString(),
        new Date(endTime).toString()
      );
      log.info(
        "本次发布耗时：",
        Math.floor((endTime - startTime) / 1000) + "秒"
      );
      console.log();
    } catch (e) {
      log.error(e.message);
      if (process.env.LOG_LEVEL === "verbose") {
        console.log(e);
      }
    }
  }

  prepare() {
    // 1. 确认项目是否为npm项目
    const projectPath = process.cwd();
    const pkgPath = path.resolve(projectPath, "package.json");
    log.verbose("package.json", pkgPath);
    if (!fs.existsSync(pkgPath)) {
      throw new Error("package.json不存在");
    }
    // 2.确认是否包含name，version，build命令
    const pkg = fse.readJsonSync(pkgPath);
    const { name, version, scripts } = pkg;
    log.verbose("package.json", name, version, scripts.build);
    if (!name || !version || !scripts || !scripts.build) {
      throw new Error(
        "package.json信息不全，请检查是否存在name、version、scripts（需提供build命令）！"
      );
    }
    this.projectInfo = { name, version, dir: projectPath };
  }
}

function init(argv) {
  new PublishCommand(argv);
}

module.exports = init;
module.exports.PublishCommand = PublishCommand;

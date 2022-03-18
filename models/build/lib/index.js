"use strict";
const io = require("socket.io-client");
const log = require("@bear-cli/log");
const get = require("lodash/get");
const { getOSSProject } = require("./getOSSProject");
const inquirer = require("inquirer");
const { parseMsg } = require("./parse");
const chalk = require("chalk");

const WS_SERVER = "ws://127.0.0.1:7001";
const FAILED_CODE = [
  "prepare failed",
  "download failed",
  "build failed",
  "pre-publish failed",
  "publish failed",
];

const TIME_OUT = 5 * 60 * 1000;
const CONNECT_TIME_OUT = 5 * 1000;
class CloudBuild {
  constructor(git, type, options = {}) {
    log.verbose("CloudBuild options", options);
    this._git = git;
    // 暂时只支持OSS,接下来会支持COS和七牛云
    this._type = type;
    // 超时时间，默认20分钟
    // get(options, "timeout") || 1200 * 1000;
    this._timeout = TIME_OUT;
    this._prod = options.prod;
    this._keepCache = options.keepCache;
    this._cnpm = options.cnpm;
    this._buildCmd = options.buildCmd;
  }

  timeout(fn, timeout) {
    clearTimeout(this.timer);
    log.notice("设置任务超时时间：", `${+timeout / 1000}秒`);
    this.timer = setTimeout(fn, timeout);
  }

  async prepare() {
    // 如果是上线发布，则检查OSS中是否存在项目
    const projectName = this._git.name;
    if (this._prod) {
      const ossProject = await getOSSProject({
        name: projectName,
        type: this._prod ? "prod" : "dev",
      });
      if (ossProject.code === 0 && ossProject.data.length > 0) {
        const cover = (
          await inquirer.prompt({
            type: "list",
            name: "cover",
            choices: [
              { name: "覆盖发布", value: true },
              { name: "放弃发布", value: false },
            ],
            defaultValue: true,
            message: `OSS已存在 [${projectName}] 项目，是否强行覆盖发布？`,
          })
        ).cover;
        if (!cover) {
          throw new Error("发布终止");
        }
      }
    }
  }

  init() {
    log.notice("开始云构建任务初始化");
    return new Promise((resolve, reject) => {
      const socket = io(WS_SERVER, {
        query: {
          repo: this._git.remote,
          type: this._type,
          name: this._git.name,
          branch: this._git.branch,
          version: this._git.version,
          prod: this._prod,
          keepCache: this._keepCache,
          cnpm: this._cnpm,
          buildCmd: this._buildCmd,
        },
        transports: ["websocket"],
      });
      this.timeout(() => {
        log.error("云构建服务创建超时，自动终止");
        disconnect();
      }, CONNECT_TIME_OUT);
      const disconnect = () => {
        clearTimeout(this.timer);
        socket.disconnect();
        socket.close();
      };
      socket.on("connect", () => {
        const id = socket.id;
        log.success("云构建任务创建成功", `任务ID：${id}`);
        this.timeout(() => {
          log.error("云构建服务执行超时，自动终止");
          disconnect();
        }, this._timeout);
        socket.on(id, (msg) => {
          const parsedMsg = parseMsg(msg);
          log.success(parsedMsg.action, parsedMsg.message);
        });
        resolve();
      });
      socket.on("disconnect", () => {
        log.success("disconnect", "云构建任务断开");
        disconnect();
      });
      socket.on("error", (err) => {
        log.error("云构建出错", err);
        disconnect();
        reject(err);
      });
      this._socket = socket;
    });
  }

  build() {
    let ret = true;
    return new Promise((resolve, reject) => {
      this._socket.emit("build");
      this._socket.on("build", (msg) => {
        const parsedMsg = parseMsg(msg);
        if (FAILED_CODE.indexOf(parsedMsg.action) >= 0) {
          log.error(parsedMsg.action, parsedMsg.message);
          clearTimeout(this.timer);
          this._socket.disconnect();
          this._socket.close();
          ret = false;
        } else {
          if (parsedMsg.action === "build success") {
            log.success(
              parsedMsg.action,
              chalk.hex("#DEADED").bold(parsedMsg.message)
            );
          } else {
            log.success(parsedMsg.action, parsedMsg.message);
          }
        }
      });
      this._socket.on("building", (msg) => {
        console.log(msg);
      });
      this._socket.on("disconnect", () => {
        resolve(ret);
      });
      this._socket.on("error", (err) => {
        reject(err);
      });
    });
  }
}

module.exports = CloudBuild;

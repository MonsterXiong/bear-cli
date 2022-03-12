"use strict";
const { isObject } = require("@bear-cli/utils");
const { getNpmLatestVersion } = require("@bear-cli/get-npm-info");
const pathExists = require("path-exists").sync;
const fse = require("fs-extra");
const npminstall = require("npminstall");

class Package {
  constructor(options) {
    if (!options) {
      throw new Error("Package类的options参数不能为空！");
    }
    if (!isObject(options)) {
      // TODO:没有处理空对象问题
      throw new Error("Package类的options参数必须为对象！");
    }

    // package的目标路径
    this.targetPath = options.targetPath;
    // 缓存package的路径
    this.storeDir = options.storeDir;
    // package的name
    this.packageName = options.packageName;
    // package的version
    this.packageVersion = options.packageVersion;
    // package的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace("/", "_");
  }

  // 初始化，检查是否有缓存文件夹
  // 如果packageName===latest就去获取最新的一个版本
  async prepare() {
    if (this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirpSync(this.storeDir);
    }
    if (this.packageVersion === "latest") {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
      console.log("最新npm版本为：", this.packageVersion);
    }
  }

  get cacheFilePath() {
    // C:\Users\admin\.bear-cli\dependencies\node_modules
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}`);
  }
  // 判断当前Package是否存在
  async exists() {
    if (this.storeDir) {
      await this.prepare();
      return pathExists(this.cacheFilePath);
    } else {
      return pathExists(this.targetPath);
    }
  }

  // 安装package
  async install() {
    await this.prepare();
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion,
        },
      ],
    });
  }

  // 更新package
  async update() {}
}

module.exports = Package;

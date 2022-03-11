"use strict";

const axios = require("axios");

const TB_REGISTRY = "https://registry.npmmirror.com";
const DEFAULT_REGISTRY = "https://registry.npmjs.org";

async function getNpmInfo(npmName, registry) {
  if (!npmName) return null;

  const registryUrl = registry || getDefaultRegistry();

  try {
    const res = await axios.get(`${registryUrl}/${npmName}`);
    if (res.status === 200) {
      return res.data;
    }
    return null;
  } catch (error) {
    throw new Error(error);
  }
}

function getDefaultRegistry(isOriginal = false) {
  return isOriginal ? DEFAULT_REGISTRY : TB_REGISTRY;
}

async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}

async function getNpmLatestVersion(npmName, registry) {
  let versions = await getNpmVersions(npmName, registry);
  if (versions) {
    return versions.sort((a, b) => b - a)[versions.length - 1];
  }
  return null;
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getDefaultRegistry,
  getNpmLatestVersion,
};

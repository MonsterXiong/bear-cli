const request = require("@bear-cli/request");

function getOSSProject(params) {
  return request({
    url: "/project/oss",
    params,
  });
}

module.exports = { getOSSProject };

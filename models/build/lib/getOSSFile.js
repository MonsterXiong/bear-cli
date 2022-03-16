const request = require("@bear-cli/request");

function getOSSFile(params) {
  return request({
    url: "/oss/get",
    params,
  });
}

module.exports = { getOSSFile };

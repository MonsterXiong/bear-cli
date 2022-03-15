const request = require("@bear-cli/request");

function getProjectTemplate() {
  return request({
    url: "/project/template",
  });
}
module.exports = {
  getProjectTemplate,
};

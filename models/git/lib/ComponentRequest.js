const request = require("@bear-cli/request");

function createComponent(component) {
  return request({
    method: "post",
    url: "/api/v1/components",
    data: component,
  });
}
module.exports = {
  createComponent,
};

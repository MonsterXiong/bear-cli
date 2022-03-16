const GitServer = require("./GitServer");
const GiteeRequest = require("./GiteeRequest");

class Gitee extends GitServer {
  constructor() {
    super("gitee");
    this.request = null;
  }
  setToken(token) {
    this.request = new GiteeRequest(token);
  }

  getUser() {
    return this.request.get("/user").then((response) => {
      return this.handleResponse(response);
    });
  }

  getOrg(username) {
    return this.request.get(`/user/${username}/orgs`, {
      page: 1,
      per_page: 100,
      // admin: true,
    });
  }

  getRepo = (owner, repo) => {
    return this.request.get(`/repos/${owner}/${repo}`).then((response) => {
      return this.handleResponse(response);
    });
  };

  createRepo = (repo) => {
    return this.request.post("/user/repos", {
      name: repo,
    });
  };

  createOrgRepo = (repo, login) => {
    return this.request.post(`/orgs/${login}/repos`, {
      name: repo,
    });
  };

  getSSHKeysUrl = () => {
    return "https://gitee.com/profile/sshkeys";
  };

  getSSHKeysHelpUrl = () => {
    return "https://gitee.com/help/articles/4191";
  };

  getTokenUrl() {
    return "https://gitee.com/personal_access_tokens";
  }

  getRemote(login, repo) {
    return `git@gitee.com:${login}/${repo}.git`;
  }
}

module.exports = Gitee;

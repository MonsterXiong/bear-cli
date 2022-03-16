const GitServer = require("./GitServer");
const GithubRequest = require("./GithubRequest");

class GitHub extends GitServer {
  constructor() {
    super("github");
    this.request = null;
  }

  getUser() {
    return this.request.get("/user");
  }
  // getUser = () => {
  //   return this.request.get("/user").then((response) => {
  //     return this.handleResponse(response);
  //   });
  // };

  getOrg(username) {
    return this.request.get(`/user/orgs`, {
      page: 1,
      per_page: 100,
    });
  }

  // getOrgs = () => {
  //   return this.request
  //     .get("/user/orgs", {
  //       page: 1,
  //       per_page: 100,
  //     })
  //     .then((response) => {
  //       return this.handleResponse(response);
  //     });
  // };

  getRepo(login, name) {
    return this.request.get(`/repos/${login}/${name}`).then((response) => {
      return this.handleResponse(response);
    });
  }

  createRepo(name) {
    return this.request.post(
      "/user/repos",
      {
        name,
      },
      {
        Accept: "application/vnd.github.v3+json",
      }
    );
  }

  createOrgRepo(name, login) {
    return this.request.post(
      `/orgs/${login}/repos`,
      {
        name,
      },
      {
        Accept: "application/vnd.github.v3+json",
      }
    );
  }

  setToken(token) {
    super.setToken(token);
    this.request = new GithubRequest(token);
  }
  getTokenUrl() {
    return "https://github.com/settings/tokens";
  }

  getTokenHelpUrl() {
    return "https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh";
  }

  getRemote(login, name) {
    return `git@github.com:${login}/${name}.git`;
  }
}

module.exports = GitHub;

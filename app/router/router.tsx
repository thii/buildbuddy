import capabilities from "../capabilities/capabilities";
import format from "../format/format";

class Router {
  register(pathChangeHandler: VoidFunction) {
    history.pushState = ((f) =>
      function pushState() {
        var ret = f.apply(this, arguments);
        pathChangeHandler();
        return ret;
      })(history.pushState);

    history.replaceState = ((f) =>
      function replaceState() {
        var ret = f.apply(this, arguments);
        pathChangeHandler();
        return ret;
      })(history.replaceState);

    window.addEventListener("popstate", () => {
      pathChangeHandler();
    });
  }

  navigateTo(path: string) {
    var newUrl = window.location.protocol + "//" + window.location.host + path;
    window.history.pushState({ path: newUrl }, "", newUrl);
  }

  navigateToQueryParam(key: string, value: string) {
    let targetUrl = `?${key}=${value}`;
    window.history.pushState({ path: targetUrl }, "", targetUrl);
  }

  navigateHome(hash?: string) {
    this.navigateTo("/" + (hash || ""));
  }

  navigateToSetup() {
    this.navigateTo(Path.setupPath);
  }

  navigateToWorkflows() {
    if (!capabilities.canNavigateToPath(Path.workflowsPath)) {
      alert(`Workflows are not available in ${capabilities.name}`);
      return;
    }
    this.navigateTo(Path.workflowsPath);
  }

  navigateToSettings() {
    if (!capabilities.canNavigateToPath(Path.settingsPath)) {
      alert(`Settings are not available in ${capabilities.name}`);
      return;
    }
    this.navigateTo(Path.settingsPath);
  }

  navigateToTrends() {
    if (!capabilities.canNavigateToPath(Path.trendsPath)) {
      alert(`Trends are not available in ${capabilities.name}`);
      return;
    }
    this.navigateTo(Path.trendsPath);
  }

  navigateToExecutors() {
    if (!capabilities.canNavigateToPath(Path.executorsPath)) {
      alert(`Executors are not available in ${capabilities.name}`);
      return;
    }
    this.navigateTo(Path.executorsPath);
  }

  navigateToTap() {
    if (!capabilities.canNavigateToPath(Path.tapPath)) {
      alert(`The test dashboard is not available in ${capabilities.name}`);
      return;
    }
    this.navigateTo(Path.tapPath);
  }

  navigateToInvocation(invocationId: string) {
    if (!capabilities.canNavigateToPath(Path.invocationPath)) {
      alert(`Invocations are not available in ${capabilities.name}`);
      return;
    }
    this.navigateTo(Path.invocationPath + invocationId);
  }

  navigateToUserHistory(user: string) {
    if (!capabilities.canNavigateToPath(Path.userHistoryPath)) {
      alert(
        `User history is not available in ${capabilities.name}.\n\nClick 'Upgrade to Enterprise' in the menu to enable user build history, organization build history, SSO, and more!`
      );
      return;
    }
    this.navigateTo(Path.userHistoryPath + user);
  }

  navigateToHostHistory(host: string) {
    if (!capabilities.canNavigateToPath(Path.hostHistoryPath)) {
      alert(
        `Host history is not available in ${capabilities.name}.\n\nClick 'Upgrade to Enterprise' in the menu to enable user build history, organization build history, SSO, and more!`
      );
      return;
    }
    this.navigateTo(Path.hostHistoryPath + host);
  }

  navigateToRepoHistory(repo: string) {
    if (!capabilities.canNavigateToPath(Path.repoHistoryPath)) {
      alert(
        `Repo history is not available in ${capabilities.name}.\n\nClick 'Upgrade to Enterprise' in the menu to enable user build history, organization build history, SSO, and more!`
      );
      return;
    }
    if (repo.startsWith("https://github.com/") && repo.endsWith(".git")) {
      this.navigateTo(Path.repoHistoryPath + format.formatGitUrl(repo));
      return;
    }
    this.navigateTo(Path.repoHistoryPath + btoa(repo));
  }

  navigateToCommitHistory(commit: string) {
    if (!capabilities.canNavigateToPath(Path.commitHistoryPath)) {
      alert(
        `Commit history is not available in ${capabilities.name}.\n\nClick 'Upgrade to Enterprise' in the menu to enable user build history, organization build history, SSO, and more!`
      );
      return;
    }
    this.navigateTo(Path.commitHistoryPath + commit);
  }

  navigateToCreateOrg() {
    if (!capabilities.createOrg) {
      window.open("https://buildbuddy.typeform.com/to/PFjD5A", "_blank");
      return;
    }
    this.navigateTo(Path.createOrgPath);
  }

  updateParams(params: Record<string, string>) {
    const newUrl = getModifiedUrl({ query: params });
    window.history.pushState({ path: newUrl }, "", newUrl);
  }

  replaceParams(params: Record<string, string>) {
    const newUrl = getModifiedUrl({ query: params });
    window.history.replaceState({ path: newUrl }, "", newUrl);
  }

  getLastPathComponent(path: string, pathPrefix: string) {
    if (!path.startsWith(pathPrefix)) {
      return null;
    }
    return decodeURIComponent(path.replace(pathPrefix, ""));
  }

  getInvocationId(path: string) {
    return this.getLastPathComponent(path, Path.invocationPath);
  }

  getInvocationIdsForCompare(path: string) {
    const idsComponent = this.getLastPathComponent(path, Path.comparePath);
    if (!idsComponent) {
      return null;
    }
    const [a, b] = idsComponent.split("...");
    if (!a || !b) {
      return null;
    }
    return { a, b };
  }

  getHistoryUser(path: string) {
    return this.getLastPathComponent(path, Path.userHistoryPath);
  }

  getHistoryHost(path: string) {
    return this.getLastPathComponent(path, Path.hostHistoryPath);
  }

  getHistoryRepo(path: string) {
    let repoComponent = this.getLastPathComponent(path, Path.repoHistoryPath);
    if (repoComponent?.includes("/")) {
      return `https://github.com/${repoComponent}.git`;
    }
    return repoComponent ? atob(repoComponent) : "";
  }

  getHistoryCommit(path: string) {
    return this.getLastPathComponent(path, Path.commitHistoryPath);
  }
}

function getQueryString(params: Record<string, string>) {
  return Object.keys(params)
    .filter((key) => Boolean(params[key]))
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join("&");
}

function getModifiedUrl({ query }: { query?: Record<string, string> }) {
  const queryString = query ? getQueryString(query) : window.location.search;

  return (
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    (queryString ? "?" : "") +
    queryString +
    window.location.hash
  );
}

export class Path {
  static comparePath = "/compare/";
  static invocationPath = "/invocation/";
  static userHistoryPath = "/history/user/";
  static hostHistoryPath = "/history/host/";
  static repoHistoryPath = "/history/repo/";
  static commitHistoryPath = "/history/commit/";
  static setupPath = "/docs/setup/";
  static settingsPath = "/settings/";
  static createOrgPath = "/org/create";
  static editOrgPath = "/org/edit";
  static trendsPath = "/trends/";
  static executorsPath = "/executors/";
  static tapPath = "/tests/";
  static workflowsPath = "/workflows/";
}

export default new Router();

const EventEmitter = require('microevent');

const BASE_URL = (window && window.version_base_url) || 'https://api.releasepage.co';
const HELP_URL = (window && window.help_base_url) || 'https://help.releasepage.co/api/getting-started';

const GITHUB_BASE_URL = 'https://api.github.com/repos/:owner/:repo/releases/latest';

const Version = function (opts = {}) {
  this.opts = opts;
  this.bind('load', () => this.render());
};

Version.prototype = {
  options(opts) {
    this.opts = opts;
    return this;
  },

  load() {
    if (this.opts.github) {
      this.useGitHub = true;
    } else {
      if (!this.opts.apiKey) {
        console.error('version.js: no key provided');
      }
      if (!this.opts.pageId) {
        console.error('version.js: no pageId provided');
      }
    }

    const onLoad = this.onLoad.bind(this);
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function () {
      onLoad({ status: this.status, response: this.response });
    });
    const url = this.getUrl();
    xhr.open('GET', url);
    xhr.send();
  },

  getUrl() {
    if (this.useGitHub) {
      const { repo } = this.opts.github;
      return GITHUB_BASE_URL.replace(':owner/:repo', repo);
    }
    return `${BASE_URL}/v1/pages/${this.opts.pageId}/version?apiKey=${this.opts.apiKey}`;
  },

  onLoad(resp) {
    return this.useGitHub ? this.parseGitHubResponse(resp) : this.parseReleasePageResponse(resp);
  },

  parseGitHubResponse({ status, response }) {
    switch (status) {
      case 401:
        return console.error('version.js: Bad GitHub credentials');
      case 403:
        return console.error('version.js: Access is denied to that GitHub repository');
      case 404:
        return console.error('version.js: GitHub repository not found');
      case 301:
        return console.error('version.js: GitHub repository has moved permanently');
      case 302:
      case 307:
        return console.error('version.js: GitHub repository has moved');
      case 200: {
        const data = JSON.parse(response);
        this.latest = [{
          repo: this.opts.github.repo,
          version: data.tag_name,
          author: data.author.login,
          published_at: data.published_at
        }];
        break;
      }
      default:
        return console.error('version.js: GitHub API error', status, response);
    }
    return this.trigger('load');
  },

  parseReleasePageResponse({ status, response }) {
    switch (status) {
      case 404:
        return console.error(
          `version.js: A Release Page with id ${this.opts.pageId} does not exist`
        );
      case 401:
        console.error(
          `version.js: enable the version api for this Release Page: ${HELP_URL}`
        );
        break;
      case 200: {
        const data = JSON.parse(response);
        this.latest = data.latest;
        this.latestGrouped = data.latestGrouped;
        this.permalink = data.permalink;
        break;
      }
      default:
        return console.error('version.js: ReleasePage API error', status, response);
    }
    return this.trigger('load');
  },

  render() {
    const badgeEls = document.querySelectorAll('[data-version-badge]');
    if (badgeEls.length) {
      this.renderBadges({ elements: badgeEls });
    }
    const repoNameEls = document.querySelectorAll('[data-repo-name]');
    if (repoNameEls.length) {
      this.renderRepoNames({ elements: repoNameEls });
    }
    const authorEls = document.querySelectorAll('[data-version-author]');
    if (authorEls.length) {
      this.renderAuthors({ elements: authorEls });
    }
    const renderPublishedAt = document.querySelectorAll('[data-version-published]');
    if (renderPublishedAt.length) {
      this.renderPublishedAt({ elements: renderPublishedAt });
    }
    return this;
  },

  renderAuthors({ elements }) {
    return elements.forEach((el) => {
      const repo = el.parentElement.getAttribute('data-version-for');
      let authors;
      if (repo) {
        authors = [this.latest.find(l => new RegExp(l.repo, 'i').test(repo)).author];
      } else if (this.latestGrouped) {
        authors = this.latestGrouped.authors;
      } else {
        authors = this.latest.reduce((all, l) => {
          if (all.includes(l.author)) return all;
          return [...all, l.author];
        }, []);
      }
      // eslint-disable-next-line no-param-reassign
      el.textContent = formatArray(authors);
    });
  },

  renderPublishedAt({ elements }) {
    return elements.forEach((el) => {
      const repo = el.parentElement.getAttribute('data-version-for');
      let publishedAt;
      if (repo) {
        publishedAt = this.latest.find(l => new RegExp(l.repo, 'i').test(repo)).published_at;
      } else if (this.isGrouped()) {
        publishedAt = this.latestGrouped.published_at;
      } else {
        publishedAt = this.latest[0].published_at;
      }
      // eslint-disable-next-line no-param-reassign
      el.textContent = new Date(publishedAt).toDateString();
    });
  },

  renderRepoNames({ elements }) {
    return elements.forEach((el) => {
      const repo = el.parentElement.getAttribute('data-version-for');
      let names;
      if (repo) {
        // use the repo provided
        const repoDetails = this.latest.find(l => new RegExp(l.repo, 'i').test(repo));
        names = [repoDetails.name || repoDetails.repo];
      } else {
        // else use all
        names = this.latest.map(l => l.name || l.repo);
      }
      // eslint-disable-next-line no-param-reassign
      el.textContent = formatArray(names);
    });
  },

  renderBadges({ elements }) {
    elements.forEach((el) => {
      const repo = el.parentElement.getAttribute('data-version-for');
      let version;
      if (repo) {
        // use the repo provided
        version = this.latest.find(l => new RegExp(l.repo, 'i').test(repo)).version;
      } else if (this.isGrouped()) {
        // if no repo provided then use the grouped version number
        version = this.latestGrouped.version;
      } else {
        // if no version yet then pick the latest one to use
        version = this.latest[0].version || this.latest[0].version;
      }
      // eslint-disable-next-line no-param-reassign
      el.textContent = version;
    });
  },

  publishedAt({ repo } = {}) {
    if (this.isGrouped()) {
      return this.latestGrouped.published_at;
    }
    if (repo) {
      const repoDetails = this.latest.find(l => new RegExp(l.repo, 'i').test(repo));
      return repoDetails ? repoDetails.published_at : null;
    }
    return this.latest[0].published_at;
  },

  author({ repo } = {}) {
    if (this.isGrouped()) {
      return this.latestGrouped.authors;
    }
    if (repo) {
      const repoDetails = this.latest.find(l => new RegExp(l.repo, 'i').test(repo));
      return repoDetails ? repoDetails.author : null;
    }
    return this.latest[0].author;
  },

  tag({ repo } = {}) {
    if (localStorage && localStorage.getItem('versionjs.debug_version')) {
      return localStorage.getItem('versionjs.debug_version');
    }
    if (this.isGrouped()) {
      return this.latestGrouped.version;
    }
    if (repo) {
      const repoDetails = this.latest.find(l => new RegExp(l.repo, 'i').test(repo));
      return repoDetails ? repoDetails.version : null;
    }
    return this.latest[0].version;
  },

  isGrouped() {
    return !!this.latestGrouped;
  }
};

EventEmitter.mixin(Version);

function formatArray(arr) {
  let outStr = '';
  if (arr.length === 1) {
    outStr = arr[0];
  } else if (arr.length === 2) {
    // joins all with "and" but no commas
    // example: "bob and sam"
    outStr = arr.join(' and ');
  } else if (arr.length > 2) {
    // joins all with commas, but last one gets ", and" (oxford comma!)
    // example: "bob, joe, and sam"
    outStr = `${arr.slice(0, -1).join(', ')}, and ${arr.slice(-1)}`;
  }
  return outStr;
}

let version;
const el = document.querySelector('script[data-page-id]');
if (el) {
  const pageId = el.getAttribute('data-page-id');
  const apiKey = el.getAttribute('data-api-key');
  if (pageId) {
    version = new Version({
      pageId,
      apiKey
    });
  } else {
    const repo = el.getAttribute('data-repo');
    version = new Version({
      github: {
        repo
      }
    });
  }
} else {
  version = new Version();
}

if (module) {
  module.exports = version;
}
if (typeof window !== 'undefined') {
  window.version = version;
  // set up automatically
  document.addEventListener('DOMContentLoaded', () => {
    version.load();
  });
}

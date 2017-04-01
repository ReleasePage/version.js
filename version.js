const BASE_URL = window.__version_base_url || 'http://api.releasepage.co';
const HELP_URL = window.__help_base_url || 'https://help.releasepage.co/api/getting-started';

const Version = function (opts) {
  this.options = opts;
};

Version.prototype = {
  load() {
    const onLoad = this.onLoad.bind(this);
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function () {
      onLoad({ status: this.status, response: this.response });
    });
    const url = `${BASE_URL}/v1/pages/${this.options.page}/version?apiKey=${this.options.apiKey}`;
    xhr.open('GET', url);
    xhr.send();
  },

  onLoad({ status, response }) {
    switch (status) {
      case 404:
        return console.error(`version.js: A page by name ${this.options.page}`);
      case 401:
        console.error(`version.js: enable the version api for this page: ${HELP_URL}`);
        break;
      case 200: {
        const data = JSON.parse(response);
        this.latest = data.latest;
        this.latestGrouped = data.latestGrouped;
        this.permalink = data.permalink;
        break;
      }
      default:
        return console.error('version.js: ReleasePage API error', status);
    }

    const badgeEls = document.querySelectorAll('[data-version-badge]');
    if (badgeEls.length) {
      this.renderBadges({ elements: badgeEls });
    }
    const repoNameEls = document.querySelectorAll('[data-repo-name]');
    if (repoNameEls.length) {
      this.renderRepoNames({ elements: repoNameEls });
    }
    return this;
  },

  renderRepoNames({ elements }) {
    return elements.forEach((el) => {
      const repoId = el.getAttribute('data-repo-name');
      const repoDetails = this.latest.find(l => l.repo === repoId);
      if (!repoDetails) return;
      // eslint-disable-next-line no-param-reassign
      el.textContent = repoDetails.name || repoDetails.repo;
    });
  },

  renderBadges({ elements }) {
    elements.forEach((el) => {
      if (el.tagName === 'A' && !el.href) {
        el.setAttribute('href', this.permalink);
      }
      const repo = el.getAttribute('data-version-repo');
      let version;
      if (repo) {
        const repoVersion = this.latest.find(l => l.repo === repo);
        version = repoVersion.version;
      }
      if (!version && this.latestGrouped) {
        version = this.latestGrouped.version;
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
      const repoDetails = this.latest.find(l => l.repo === repo);
      return repoDetails ? repoDetails.published_at : null;
    }
    return this.latest[0].published_at;
  },

  author({ repo } = {}) {
    if (this.isGrouped()) {
      return this.latestGrouped.authors;
    }
    if (repo) {
      const repoDetails = this.latest.find(l => l.repo === repo);
      return repoDetails ? repoDetails.author : null;
    }
    return this.latest[0].author;
  },

  tag({ repo } = {}) {
    if (this.isGrouped()) {
      return this.latestGrouped.version;
    }
    if (repo) {
      const repoDetails = this.latest.find(l => l.repo === repo);
      return repoDetails ? repoDetails.version : null;
    }
    return this.latest[0].version;
  },

  isGrouped() {
    return !!this.latestGrouped;
  }
};

if (typeof window !== 'undefined') {
  // set up automatically
  document.addEventListener('DOMContentLoaded', () => {
    const el = document.querySelector('script[data-page-id]');
    if (!el) return console.error('version.js: no key provided');
    const page = el.getAttribute('data-page-id');
    const apiKey = el.getAttribute('data-api-key');
    window.Version = new Version({
      page,
      apiKey
    });
    return window.Version.load();
  });
}

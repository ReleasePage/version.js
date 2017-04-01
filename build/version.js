(function () {
'use strict';

var BASE_URL = window.__version_base_url || 'http://api.releasepage.co';
var HELP_URL = window.__help_base_url || 'https://help.releasepage.co/api/getting-started';

var Version = function Version(opts) {
  this.options = opts;
};

Version.prototype = {
  load: function load() {
    var onLoad = this.onLoad.bind(this);
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function () {
      onLoad({ status: this.status, response: this.response });
    });
    var url = BASE_URL + '/v1/pages/' + this.options.page + '/version?apiKey=' + this.options.apiKey;
    xhr.open('GET', url);
    xhr.send();
  },
  onLoad: function onLoad(_ref) {
    var status = _ref.status,
        response = _ref.response;

    switch (status) {
      case 404:
        return console.error('version.js: A page by name ' + this.options.page);
      case 401:
        {
          console.error('version.js: enable the version api for this page: ' + HELP_URL);
          break;
        }
      case 200:
        {
          var data = JSON.parse(response);
          this.latest = data.latest;
          this.latestGrouped = data.latestGrouped;
          this.permalink = data.permalink;
          break;
        }
      default:
        return console.error('version.js: ReleasePage API error', status);
    }

    var badgeEls = document.querySelectorAll('[data-version-badge]');
    if (badgeEls.length) {
      this.renderBadges({ elements: badgeEls });
    }
    var repoNameEls = document.querySelectorAll('[data-repo-name]');
    if (repoNameEls.length) {
      this.renderRepoNames({ elements: repoNameEls });
    }
    return this;
  },
  renderRepoNames: function renderRepoNames(_ref2) {
    var _this = this;

    var elements = _ref2.elements;

    return elements.forEach(function (el) {
      var repoId = el.getAttribute('data-repo-name');
      var repoDetails = _this.latest.find(function (l) {
        return l.repo === repoId;
      });
      if (!repoDetails) return;
      // eslint-disable-next-line no-param-reassign
      el.textContent = repoDetails.name || repoDetails.repo;
    });
  },
  renderBadges: function renderBadges(_ref3) {
    var _this2 = this;

    var elements = _ref3.elements;

    elements.forEach(function (el) {
      if (el.tagName === 'A' && !el.href) {
        el.setAttribute('href', _this2.permalink);
      }
      var repo = el.getAttribute('data-version-repo');
      var version = void 0;
      if (repo) {
        var repoVersion = _this2.latest.find(function (l) {
          return l.repo === repo;
        });
        version = repoVersion.version;
      }
      if (!version && _this2.latestGrouped) {
        version = _this2.latestGrouped.version;
      }
      // eslint-disable-next-line no-param-reassign
      el.textContent = version;
    });
  },
  publishedAt: function publishedAt() {
    var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        repo = _ref4.repo;

    if (this.isGrouped()) {
      return this.latestGrouped.published_at;
    }
    if (repo) {
      var repoDetails = this.latest.find(function (l) {
        return l.repo === repo;
      });
      return repoDetails ? repoDetails.published_at : null;
    }
    return this.latest[0].published_at;
  },
  author: function author() {
    var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        repo = _ref5.repo;

    if (this.isGrouped()) {
      return this.latestGrouped.authors;
    }
    if (repo) {
      var repoDetails = this.latest.find(function (l) {
        return l.repo === repo;
      });
      return repoDetails ? repoDetails.author : null;
    }
    return this.latest[0].author;
  },
  tag: function tag() {
    var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        repo = _ref6.repo;

    if (this.isGrouped()) {
      return this.latestGrouped.version;
    }
    if (repo) {
      var repoDetails = this.latest.find(function (l) {
        return l.repo === repo;
      });
      return repoDetails ? repoDetails.version : null;
    }
    return this.latest[0].version;
  },
  isGrouped: function isGrouped() {
    return !!this.latestGrouped;
  }
};

if (typeof window !== 'undefined') {
  // set up automatically
  document.addEventListener('DOMContentLoaded', function () {
    var el = document.querySelector('script[data-page-id]');
    if (!el) return console.error('version.js: no key provided');
    var page = el.getAttribute('data-page-id');
    var apiKey = el.getAttribute('data-api-key');
    window.Version = new Version({
      page: page,
      apiKey: apiKey
    });
    return window.Version.load();
  });
}

}());

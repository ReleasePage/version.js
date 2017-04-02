(function () {
'use strict';

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var BASE_URL = window.__version_base_url || 'http://staging.api.releasepage.co';
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
        console.error('version.js: enable the version api for this page: ' + HELP_URL);
        break;
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
    var authorEls = document.querySelectorAll('[data-version-author]');
    if (authorEls.length) {
      this.renderAuthors({ elements: authorEls });
    }
    var renderPublishedAt = document.querySelectorAll('[data-version-published]');
    if (renderPublishedAt.length) {
      this.renderPublishedAt({ elements: renderPublishedAt });
    }
    return this;
  },
  renderAuthors: function renderAuthors(_ref2) {
    var _this = this;

    var elements = _ref2.elements;

    return elements.forEach(function (el) {
      var repo = el.parentElement.getAttribute('data-version-for');
      var authors = void 0;
      if (repo) {
        authors = [_this.latest.find(function (l) {
          return new RegExp(l.repo, 'i').test(repo);
        }).author];
      } else if (_this.latestGrouped) {
        authors = _this.latestGrouped.authors;
      } else {
        authors = _this.latest.reduce(function (all, l) {
          if (all.includes(l.author)) return all;
          return [].concat(toConsumableArray(all), [l.author]);
        }, []);
      }
      // eslint-disable-next-line no-param-reassign
      el.textContent = formatArray(authors);
    });
  },
  renderPublishedAt: function renderPublishedAt(_ref3) {
    var _this2 = this;

    var elements = _ref3.elements;

    return elements.forEach(function (el) {
      var repo = el.parentElement.getAttribute('data-version-for');
      var publishedAt = void 0;
      if (repo) {
        publishedAt = _this2.latest.find(function (l) {
          return new RegExp(l.repo, 'i').test(repo);
        }).published_at;
      } else if (_this2.isGrouped()) {
        publishedAt = _this2.latestGrouped.published_at;
      } else {
        publishedAt = _this2.latest[0].published_at;
      }
      // eslint-disable-next-line no-param-reassign
      el.textContent = new Date(publishedAt).toDateString();
    });
  },
  renderRepoNames: function renderRepoNames(_ref4) {
    var _this3 = this;

    var elements = _ref4.elements;

    return elements.forEach(function (el) {
      var repo = el.parentElement.getAttribute('data-version-for');
      var names = void 0;
      if (repo) {
        // use the repo provided
        var repoDetails = _this3.latest.find(function (l) {
          return new RegExp(l.repo, 'i').test(repo);
        });
        names = [repoDetails.name || repoDetails.repo];
      } else {
        // else use all
        names = _this3.latest.map(function (l) {
          return l.name || l.repo;
        });
      }
      // eslint-disable-next-line no-param-reassign
      el.textContent = formatArray(names);
    });
  },
  renderBadges: function renderBadges(_ref5) {
    var _this4 = this;

    var elements = _ref5.elements;

    elements.forEach(function (el) {
      var repo = el.parentElement.getAttribute('data-version-for');
      var version = void 0;
      if (repo) {
        // use the repo provided
        version = _this4.latest.find(function (l) {
          return new RegExp(l.repo, 'i').test(repo);
        }).version;
      } else if (_this4.isGrouped()) {
        // if no repo provided then use the grouped version number
        version = _this4.latestGrouped.version;
      } else {
        // if no version yet then pick the latest one to use
        version = _this4.latest[0].version || _this4.latest[0].version;
      }
      // eslint-disable-next-line no-param-reassign
      el.textContent = version;
    });
  },
  publishedAt: function publishedAt() {
    var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        repo = _ref6.repo;

    if (this.isGrouped()) {
      return this.latestGrouped.published_at;
    }
    if (repo) {
      var repoDetails = this.latest.find(function (l) {
        return new RegExp(l.repo, 'i').test(repo);
      });
      return repoDetails ? repoDetails.published_at : null;
    }
    return this.latest[0].published_at;
  },
  author: function author() {
    var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        repo = _ref7.repo;

    if (this.isGrouped()) {
      return this.latestGrouped.authors;
    }
    if (repo) {
      var repoDetails = this.latest.find(function (l) {
        return new RegExp(l.repo, 'i').test(repo);
      });
      return repoDetails ? repoDetails.author : null;
    }
    return this.latest[0].author;
  },
  tag: function tag() {
    var _ref8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        repo = _ref8.repo;

    if (this.isGrouped()) {
      return this.latestGrouped.version;
    }
    if (repo) {
      var repoDetails = this.latest.find(function (l) {
        return new RegExp(l.repo, 'i').test(repo);
      });
      return repoDetails ? repoDetails.version : null;
    }
    return this.latest[0].version;
  },
  isGrouped: function isGrouped() {
    return !!this.latestGrouped;
  }
};

function formatArray(arr) {
  var outStr = '';
  if (arr.length === 1) {
    outStr = arr[0];
  } else if (arr.length === 2) {
    // joins all with "and" but no commas
    // example: "bob and sam"
    outStr = arr.join(' and ');
  } else if (arr.length > 2) {
    // joins all with commas, but last one gets ", and" (oxford comma!)
    // example: "bob, joe, and sam"
    outStr = arr.slice(0, -1).join(', ') + ', and ' + arr.slice(-1);
  }
  return outStr;
}

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

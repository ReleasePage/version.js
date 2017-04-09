var Version = (function () {
'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var microevent = createCommonjsModule(function (module) {
/**
 * MicroEvent - to make any js object an event emitter (server or browser)
 * 
 * - pure javascript - server compatible, browser compatible
 * - dont rely on the browser doms
 * - super simple - you get it immediatly, no mistery, no magic involved
 *
 * - create a MicroEventDebug with goodies to debug
 *   - make it safer to use
*/

var MicroEvent	= function(){};
MicroEvent.prototype	= {
	bind	: function(event, fct){
		this._events = this._events || {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
	},
	unbind	: function(event, fct){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	},
	trigger	: function(event /* , args... */){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		for(var i = 0; i < this._events[event].length; i++){
			this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
		}
	}
};

/**
 * mixin will delegate all MicroEvent.js function in the destination object
 *
 * - require('MicroEvent').mixin(Foobar) will make Foobar able to use MicroEvent
 *
 * @param {Object} the object which will support MicroEvent
*/
MicroEvent.mixin	= function(destObject){
	var props	= ['bind', 'unbind', 'trigger'];
	for(var i = 0; i < props.length; i ++){
		destObject.prototype[props[i]]	= MicroEvent.prototype[props[i]];
	}
};

// export in common js
if( 'object' !== "undefined" && ('exports' in module)){
	module.exports	= MicroEvent;
}
});

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var version_1 = createCommonjsModule(function (module) {
  var BASE_URL = window && window.__version_base_url || 'http://api.releasepage.co';
  var HELP_URL = window && window.__help_base_url || 'https://help.releasepage.co/api/getting-started';

  var __Version = function __Version(opts) {
    var _this = this;

    this.opts = opts;
    this.bind('load', function () {
      return _this.render();
    });
  };

  __Version.prototype = {
    options: function options(opts) {
      this.opts = opts;
      return this;
    },
    load: function load() {
      if (this.opts.apiKey) {
        console.error('version.js: no key provided');
      }
      if (this.opts.pageId) {
        console.error('version.js: no pageId provided');
      }
      var onLoad = this.onLoad.bind(this);
      var xhr = new XMLHttpRequest();
      xhr.addEventListener('load', function () {
        onLoad({ status: this.status, response: this.response });
      });
      var url = BASE_URL + '/v1/pages/' + this.opts.page + '/version?apiKey=' + this.opts.apiKey;
      xhr.open('GET', url);
      xhr.send();
    },
    onLoad: function onLoad(_ref) {
      var status = _ref.status,
          response = _ref.response;

      switch (status) {
        case 404:
          return console.error('version.js: A Release Page with id ' + this.opts.pageId + ' does not exist');
        case 401:
          console.error('version.js: enable the version api for this Release Page: ' + HELP_URL);
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
      return this.trigger('load');
    },
    render: function render() {
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
      var _this2 = this;

      var elements = _ref2.elements;

      return elements.forEach(function (el) {
        var repo = el.parentElement.getAttribute('data-version-for');
        var authors = void 0;
        if (repo) {
          authors = [_this2.latest.find(function (l) {
            return new RegExp(l.repo, 'i').test(repo);
          }).author];
        } else if (_this2.latestGrouped) {
          authors = _this2.latestGrouped.authors;
        } else {
          authors = _this2.latest.reduce(function (all, l) {
            if (all.includes(l.author)) return all;
            return [].concat(toConsumableArray(all), [l.author]);
          }, []);
        }
        // eslint-disable-next-line no-param-reassign
        el.textContent = formatArray(authors);
      });
    },
    renderPublishedAt: function renderPublishedAt(_ref3) {
      var _this3 = this;

      var elements = _ref3.elements;

      return elements.forEach(function (el) {
        var repo = el.parentElement.getAttribute('data-version-for');
        var publishedAt = void 0;
        if (repo) {
          publishedAt = _this3.latest.find(function (l) {
            return new RegExp(l.repo, 'i').test(repo);
          }).published_at;
        } else if (_this3.isGrouped()) {
          publishedAt = _this3.latestGrouped.published_at;
        } else {
          publishedAt = _this3.latest[0].published_at;
        }
        // eslint-disable-next-line no-param-reassign
        el.textContent = new Date(publishedAt).toDateString();
      });
    },
    renderRepoNames: function renderRepoNames(_ref4) {
      var _this4 = this;

      var elements = _ref4.elements;

      return elements.forEach(function (el) {
        var repo = el.parentElement.getAttribute('data-version-for');
        var names = void 0;
        if (repo) {
          // use the repo provided
          var repoDetails = _this4.latest.find(function (l) {
            return new RegExp(l.repo, 'i').test(repo);
          });
          names = [repoDetails.name || repoDetails.repo];
        } else {
          // else use all
          names = _this4.latest.map(function (l) {
            return l.name || l.repo;
          });
        }
        // eslint-disable-next-line no-param-reassign
        el.textContent = formatArray(names);
      });
    },
    renderBadges: function renderBadges(_ref5) {
      var _this5 = this;

      var elements = _ref5.elements;

      elements.forEach(function (el) {
        var repo = el.parentElement.getAttribute('data-version-for');
        var version = void 0;
        if (repo) {
          // use the repo provided
          version = _this5.latest.find(function (l) {
            return new RegExp(l.repo, 'i').test(repo);
          }).version;
        } else if (_this5.isGrouped()) {
          // if no repo provided then use the grouped version number
          version = _this5.latestGrouped.version;
        } else {
          // if no version yet then pick the latest one to use
          version = _this5.latest[0].version || _this5.latest[0].version;
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

      if (window && window.__debug_version) {
        return window.__debug_version;
      }
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

  microevent.mixin(__Version);

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

  var version = void 0;
  var el = document.querySelector('script[data-page-id]');
  if (el) {
    var page = el.getAttribute('data-page-id');
    var apiKey = el.getAttribute('data-api-key');

    version = new __Version({
      page: page,
      apiKey: apiKey
    });
  } else {
    version = new __Version();
  }

  if (module) {
    module.exports = version;
  } else if (typeof window !== 'undefined') {
    window.version = version;
    // set up automatically
    document.addEventListener('DOMContentLoaded', function () {
      version.load();
    });
  }
});

return version_1;

}());

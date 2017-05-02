# version.js

<div>
  <a href="https://www.bithound.io/github/ReleasePage/version.js">
    <img src="https://www.bithound.io/github/ReleasePage/version.js/badges/score.svg" alt="bitHound Overall Score">
  </a>

  <a href="https://circleci.com/gh/ReleasePage/version.js">
    <img src="https://circleci.com/gh/ReleasePage/version.js.svg?style=shield&circle-token=68961a2719cf620799c76b1ed2ceffac78cc07ca" alt="Build Status"/>
  </a>

  <a href="http://versionjs.releasepage.co">
    <img src="http://api.releasepage.co/v1/pages/82d9ad09-1fde-45c8-aa16-549353d443eb/badge.svg?apiKey=live.x7izhEzWeaeKRepW" alt="Latest Release">
  </a>

  <br/>
  <br/>
</div>

`version.js` allows you to display the latest version number of your GitHub repo, shiny! ✨

---

[Demo][5]

<img width="950" alt="screen shot 2017-04-02 at 12 29 30" src="https://cloud.githubusercontent.com/assets/1462828/24584703/2b045044-17a0-11e7-9a27-87effaf65a29.png">

- [Installation](#installation)
- [Badges](#badges)
  - [Version](#version)
  - [Name](#repo-name)
  - [More](#etcetera)
- [ReleasePage Integration](#releasepage-integration)
  - [Grouped versions](#grouped-versions)
- [Other version stuff](#other-version-stuff)
- [AMD](#amd)

## Installation

Include the library from our CDN, providing the GitHub repository that you want to use.

```html
<script src="//cdn.releasepage.co/js/version.js" data-repo="releasepage/version.js"></script>
```

## Badges

### Version

Any elements with the attribute `data-version-badge` will be populated with the latest version number on page load.

```html
<p>The latest version is <span data-version-badge></span></p>
```

<img width="296" alt="screen shot 2017-04-01 at 18 44 41" src="https://cloud.githubusercontent.com/assets/1462828/24578484/6909bb62-170b-11e7-98a9-c8015e2bb21b.png">

### Repo Name
Any elements with the attribute `data-repo-name` will display the friendly name of the repository.

```html
<p>The latest version of <span data-repo-name></span> is <span data-version-badge></span></p>
```

<img width="540" alt="screen shot 2017-04-02 at 12 32 13" src="https://cloud.githubusercontent.com/assets/1462828/24584717/7100c730-17a0-11e7-923e-862a4fdecc66.png">

### Etcetera

```html
<p>
  The latest version of <span data-repo-name></span> is <span data-version-badge></span>, authored by <span data-version-author></span> on <span data-version-published></span>
</p>
```

<img width="960" alt="screen shot 2017-04-02 at 12 45 17" src="https://cloud.githubusercontent.com/assets/1462828/24584756/46739e14-17a2-11e7-8b39-5728febdea01.png">

## ReleasePage Integration

`version.js` can also be used as a [ReleasePage][6] integration allowing you to take advantage of extra cool features:

- Private repos
- Group releases from different repos into one combined version
- A more generous rate limit

---

- [Basic Demo][3]
- [Grouped Demo][4]


### Installation


Include the library from our CDN, providing your API key and the ReleasePage ID.

```html
<script src="//cdn.releasepage.co/js/version.js" data-api-key="<API_KEY>" data-page-id="<PAGE_ID>" ></script>
```

### Enable API access

If you don't have an account yet, you can create one [on our homepage][6]. After creating your first beautiful Release Page, you need to grab your API key.

Learn more about ReleasePage API keys [here][1].

### ReleasePage Badges

All of the [above badges](#badges) are also available using the ReleasePage API. However, with grouped releases some of them will behave slightly differently.

### Grouped versions

If your ReleasePage is cool enough to use [grouped releases][2] then you can display the repo versions individually, or grouped.

```html
<p>
  The latest version of <span data-repo-name></span> is <span data-version-badge></span>, authored by <span data-version-author></span> on <span data-version-published></span>
</p>
```

<img width="1312" alt="screen shot 2017-04-02 at 12 43 47" src="https://cloud.githubusercontent.com/assets/1462828/24584754/104f5404-17a2-11e7-80be-f66be498bb92.png">


Specify the repo name to include that repo individually.

```html
<p data-version-for="squarecat/release-notes">
  The latest version of <span data-repo-name></span> is <span data-version-badge></span>, authored by <span data-version-author></span> on <span data-version-published></span>
</p>
```

<img width="960" alt="screen shot 2017-04-02 at 12 45 17" src="https://cloud.githubusercontent.com/assets/1462828/24584756/46739e14-17a2-11e7-8b39-5728febdea01.png">


Note; if you don't provide a `data-version-for` container, badges will always display the grouped version if it's available.

## Other version stuff

Badges are awesome, but you can actually do a lot more with the version information we send you. `version.js` will expose a `Version` object on the `window` for you to play havoc with the version info 🤘

```node
// the tag number of the release
Version.tag()
// "v1.0.1"

// who published the release
Version.author()
// "Jivings"

// when the release was published
Version.publishedAt()
// "2017-03-26T15:28:42Z"
```

With grouped versions from the ReleasePage API this information will be a little more interesting.

```node
// the latest grouped version
Version.tag()
// "v0.4.0"

// all the authors that contributed to this group of releases
Version.author()
// [ "Jivings", "dinkydani" ]

// ok so this is the same (when the latest release was published)
Version.publishedAt()
// "2017-03-26T15:28:42Z"

```

If there is more than one repo in your ReleasePage, then the above functions will return the details for the repo with the most recent release. If you pass the name of the repo then you can override this;

```node
Version.tag({ repo: 'releasepage/version.js' })
// v1.0.2
```

## AMD

We also provide an AMD moduile for use with npm and webpack et al.

```npm install release-page-version --save-dev```

```js
const version = require('release-page-version');

// set up `version.js` using the GitHub API
version.options({
  github: {
    repo: REPO_NAME
  }
});

// ...or set up `version.js` using the ReleasePage API
version.options({
  pageId: RP_PAGE_ID,
  apiKey: RP_API_KEY
});

// when first set up `version.js` will automatically request
// the version information. The `load` event will be fired
// when it is returned
version.on('load', () => {
  console.log(`New version: ${version.tag()}`);
});

// ...subsequently you can call `load` manually
// to retrieve the latest information
version.load();
```

# Stay in touch
Follow us on Twitter: [@ReleasePage][7]

Email us: hi@releasepage.co


[1]: https://help.releasepage.co/api/getting-started
[2]: https://help.releasepage.co/faq/release-pages/how-do-i-group-multiple-repositories-into-one-release-page
[3]: http://codepen.io/Jivings/pen/KWJwxY
[4]: http://codepen.io/Jivings/pen/zZezNa
[5]: https://codepen.io/Jivings/pen/ybOyRE
[6]: https://releasepage.co
[7]: https://twitter.com/ReleasePage

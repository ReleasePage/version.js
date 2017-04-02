# version.js

`version.js` allows you to display the latest version number of your webapp, shiny! ✨

## Enable API access

First you need to grab your ReleasePage API key. Learn more about the ReleasePage API [here][1].

## Installation

Include the library from our CDN, providing your API key and the ReleasePage ID.

```html
<script src="//cdn.releasepage.co/js/version.js" data-api-key="<API_KEY>" data-page-id="<PAGE_ID>" ></script>
```

## Badges

### Version

Any elements with the attribute `data-version-badge` will be populated with the latest version number on page load.

```html
<p>The latest version is <span data-version-badge></span></p>
```

<img width="296" alt="screen shot 2017-04-01 at 18 44 41" src="https://cloud.githubusercontent.com/assets/1462828/24578484/6909bb62-170b-11e7-98a9-c8015e2bb21b.png">

### Name
Any elements with the attribute `data-repo-name` will display the friendly name of the repository.

```html
<p>The latest version of <span data-repo-name></span> is <span data-version-badge></span></p>
```

## Grouped versions

If your ReleasePage has [grouped versions][2] then you can display the repo versions individually, or as a grouped version.

```html
<p data-version-for="releasepage/version.js">
  The latest version of <span data-repo-name></span> is <span data-version-badge></span>
</p>
```

Without providing a `data-version-for` container, the badges will always display the grouped version if available.

## Other version stuff 🚀

Badges are awesome, but you can actually do a lot more with the version information we send you. `version.js` will expose a `Version` object on the `window` for you to play havoc with the version info.

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

With grouped versions this information will be a little more interesting.

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


[1]: https://help.releasepage.co/api/getting-started
[2]: https://help.releasepage.co/
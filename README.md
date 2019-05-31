# FileXShared

[![Travis](https://img.shields.io/travis/TiagoDanin/FileXShared.svg?branch=master&style=flat-square)](https://travis-ci.org/TiagoDanin/FileXShared) [![Downloads](https://img.shields.io/npm/dt/filexshared.svg?style=flat-square)](https://npmjs.org/package/filexshared) [![Node](https://img.shields.io/node/v/filexshared.svg?style=flat-square)](https://npmjs.org/package/filexshared) [![Version](https://img.shields.io/npm/v/filexshared.svg?style=flat-square)](https://npmjs.org/package/filexshared) [![XO code style](https://img.shields.io/badge/code%20style-XO-red.svg?style=flat-square)](https://github.com/xojs/xo) 

Share files Fast, Easy and Secure, to world or on your local network.

![](media/screenshot.png)

## Installation

Module available through the [npm registry](https://www.npmjs.com/). It can be installed using the  [`npm`](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) or [`yarn`](https://yarnpkg.com/en/) command line tools.

```sh
# NPM
npm install filexshared --global
# Or Using Yarn
yarn global add filexshared
```

## Usage

```sh
# Start
fileXShared

# Start (with dark theme)
filexshared --dark

# Start (enable password)
filexshared --password=1234567890

# Start (without "Close Server" option)
filexshared --disable-close
```

## Tests

To run the test suite, first install the dependencies, then run `test`:

```sh
# NPM
npm test
# Or Using Yarn
yarn test
```

## Dependencies

- [body-parser](https://ghub.io/body-parser): Node.js body parsing middleware
- [cookie-session](https://ghub.io/cookie-session): cookie session middleware
- [express](https://ghub.io/express): Fast, unopinionated, minimalist web framework
- [express-handlebars](https://ghub.io/express-handlebars): A Handlebars view engine for Express which doesn&#x27;t suck.
- [filenamify](https://ghub.io/filenamify): Convert a string to a valid safe filename
- [hubdown](https://ghub.io/hubdown): Convert markdown to GitHub-style HTML using a common set of remark plugins
- [mime](https://ghub.io/mime): A comprehensive library for mime-type mapping
- [minimist](https://ghub.io/minimist): parse argument options
- [multer](https://ghub.io/multer): Middleware for handling &#x60;multipart/form-data&#x60;.
- [path-exists](https://ghub.io/path-exists): Check if a path exists
- [uikit](https://ghub.io/uikit): UIkit is a lightweight and modular front-end framework for developing fast and powerful web interfaces.

## Dev Dependencies

- [xo](https://ghub.io/xo): JavaScript happiness style linter ❤️

## Contributors

Pull requests and stars are always welcome. For bugs and feature requests, please [create an issue](https://github.com/TiagoDanin/FileXShared/issues). [List of all contributors](https://github.com/TiagoDanin/FileXShared/graphs/contributors).

## License

[MIT](LICENSE) © [Tiago Danin](https://TiagoDanin.github.io)
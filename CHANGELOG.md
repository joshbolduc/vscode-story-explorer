# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.7.1](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.7.0...v0.7.1) (2023-02-07)

### Bug Fixes

- support `satisfies` and multiple type assertions on `Meta` objects ([38a0d1c](https://github.com/joshbolduc/vscode-story-explorer/commit/38a0d1cd127c4e984c70613af9abc12726448955))

## [0.7.0](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.6.3...v0.7.0) (2023-02-05)

### Features

- support mdx2 ([b842de6](https://github.com/joshbolduc/vscode-story-explorer/commit/b842de6685fdbe6e56a43aec918508b3b693ab5c))

### [0.6.3](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.6.2...v0.6.3) (2023-02-03)

### [0.6.2](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.6.1...v0.6.2) (2023-01-16)

### [0.6.1](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.6.0...v0.6.1) (2022-07-17)

### Bug Fixes

- correctly poll for server port on win32 ([61c0f67](https://github.com/joshbolduc/vscode-story-explorer/commit/61c0f676718c7f2c9cf817b85c75f828905270e6))
- execute start-storybook directly, not via node ([da6e134](https://github.com/joshbolduc/vscode-story-explorer/commit/da6e134aaf8e8af6462e06ba4d00360a65d7595d))
- fix start-storybook detection on win32 ([fb567b9](https://github.com/joshbolduc/vscode-story-explorer/commit/fb567b9229893328ab77f06b021ba99b9555f182))
- make webview loading animation more closely match vscode's ([070da69](https://github.com/joshbolduc/vscode-story-explorer/commit/070da69c57da573f15c32534210354a97489de0c))
- scan child processes for opened storybook ports ([def9eac](https://github.com/joshbolduc/vscode-story-explorer/commit/def9eacfb1eda2889a20c98d9c06faf239e29741)), closes [#474](https://github.com/joshbolduc/vscode-story-explorer/issues/474)
- set aria role on webview loading progress bar ([351850a](https://github.com/joshbolduc/vscode-story-explorer/commit/351850a033b83fcf1545a0926fdb4ccd7ccbff4d))

## [0.6.0](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.5.10...v0.6.0) (2022-07-14)

### Features

- add refresh stories command ([99ebe84](https://github.com/joshbolduc/vscode-story-explorer/commit/99ebe846bb14b0dddfb2c33d557506afcbd13966))

### Bug Fixes

- use kind name as webview title for docs ([60fd979](https://github.com/joshbolduc/vscode-story-explorer/commit/60fd979f639c8b4471653ec32dda3a1adfe194ec))

### [0.5.10](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.5.9...v0.5.10) (2022-07-08)

### Bug Fixes

- default `server.internal.enabled` value should be boolean ([f1056ea](https://github.com/joshbolduc/vscode-story-explorer/commit/f1056ea0bdb9ee8fa4011d0e8a403fca3aa59dd0))
- improve start-storybook script detection ([cf68b06](https://github.com/joshbolduc/vscode-story-explorer/commit/cf68b06ea3a8af424bc0520537b2c9bc8f2e9100)), closes [#460](https://github.com/joshbolduc/vscode-story-explorer/issues/460)

### [0.5.9](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.5.8...v0.5.9) (2022-07-06)

### [0.5.8](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.5.7...v0.5.8) (2022-07-02)

### Bug Fixes

- add more debug logging ([3286b72](https://github.com/joshbolduc/vscode-story-explorer/commit/3286b72a303d62970ff066292abcbcb383047b29))
- improve logging of objects ([51c26d8](https://github.com/joshbolduc/vscode-story-explorer/commit/51c26d8ba1318e1d13b191b15cf74e233d97596a))

### [0.5.7](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.5.6...v0.5.7) (2022-07-01)

### Bug Fixes

- ignore default excludes when searching for start-storybook ([8a6b408](https://github.com/joshbolduc/vscode-story-explorer/commit/8a6b408afb7e044d86843d413ac2b15b114204a4))

### [0.5.6](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.5.5...v0.5.6) (2022-06-27)

### Bug Fixes

- detect storybook configurations with non-`.js` extensions ([0e61e74](https://github.com/joshbolduc/vscode-story-explorer/commit/0e61e749c5bf7d31e397cf396e10b7f882e204d6)), closes [#451](https://github.com/joshbolduc/vscode-story-explorer/issues/451)
- fix typo in error message ([9f4a937](https://github.com/joshbolduc/vscode-story-explorer/commit/9f4a9374a8bf3cc9737cc95a07a45f1865e58ca0))
- improve messaging when no stories found ([ac48ac1](https://github.com/joshbolduc/vscode-story-explorer/commit/ac48ac152fca2ca8779d29b8a6716e9c3f97e0a0))

### [0.5.5](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.5.4...v0.5.5) (2022-06-16)

### Bug Fixes

- abort failed launch without waiting for user acknowledgment ([961e94d](https://github.com/joshbolduc/vscode-story-explorer/commit/961e94d19fc7f1eb83b7e0bc6158a20447711d7f))
- clear failed launch state to unblock future attempts ([5a45ed3](https://github.com/joshbolduc/vscode-story-explorer/commit/5a45ed342739f7c2e4b660f3e6cfb19d8346f3da))
- improve filesystem compatibility ([aee143b](https://github.com/joshbolduc/vscode-story-explorer/commit/aee143b9f86fbf39383ea218b5d0cbba27b71236))

### [0.5.4](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.5.3...v0.5.4) (2022-06-11)

### Features

- support new Storybook 6.5 auto-title behaviors ([7342798](https://github.com/joshbolduc/vscode-story-explorer/commit/73427989bfafb5a5b33df4d2dd16c0aa6dac35b5))

### [0.5.3](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.5.2...v0.5.3) (2022-06-09)

### Features

- make some settings language-overridable ([da64aa2](https://github.com/joshbolduc/vscode-story-explorer/commit/da64aa2857415aea676ef645bf85c283303be902))

### [0.5.2](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.5.1...v0.5.2) (2022-06-05)

### [0.5.1](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.5.0...v0.5.1) (2022-01-06)

### Bug Fixes

- initially expand tree node for active file ([dd01cdc](https://github.com/joshbolduc/vscode-story-explorer/commit/dd01cdc7b397cd1499f84399740309aaa5ded80e))

## [0.5.0](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.4.0...v0.5.0) (2021-12-04)

### Features

- support passing custom args to start-storybook script ([3740528](https://github.com/joshbolduc/vscode-story-explorer/commit/37405286cb01459f36fa148ab0cbda925d26d52b)), closes [#121](https://github.com/joshbolduc/vscode-story-explorer/issues/121)

## [0.4.0](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.3.0...v0.4.0) (2021-12-04)

### Features

- add logLevel setting ([6175017](https://github.com/joshbolduc/vscode-story-explorer/commit/61750171b5dab32bf0150bb237721b1b9eaaa37c))

### Bug Fixes

- ignore empty csf v2 storyName ([39a8e09](https://github.com/joshbolduc/vscode-story-explorer/commit/39a8e09637017655eda7bfcc3371367af1738557))
- improve Error logging ([262bd41](https://github.com/joshbolduc/vscode-story-explorer/commit/262bd417c22f7f568f1ce104fa57410b16be13a2))
- warn when config file parsing fails ([a528f26](https://github.com/joshbolduc/vscode-story-explorer/commit/a528f2665dcf180c7904d6c7493204fe377959ba))

## [0.3.0](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.2.1...v0.3.0) (2021-12-04)

### Features

- support new stories config format and autotitle ([5fd99c8](https://github.com/joshbolduc/vscode-story-explorer/commit/5fd99c844b5ae3bc4d583fd17f9e610cb9455825))

### [0.2.1](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.2.0...v0.2.1) (2021-12-03)

### Bug Fixes

- switch from micromatch to picomatch ([11f532c](https://github.com/joshbolduc/vscode-story-explorer/commit/11f532c59168d3b405d67707dcffaa4fba4956bf))

## [0.2.0](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.1.0...v0.2.0) (2021-07-10)

### Features

- support CSF 1.0-style story name ([bb00ff3](https://github.com/joshbolduc/vscode-story-explorer/commit/bb00ff39bbc29ca162bd279fc98215bf26a7223b))
- support custom meta IDs ([db226c5](https://github.com/joshbolduc/vscode-story-explorer/commit/db226c541690584a7b3eb4a15878086f8db05a14))

### Bug Fixes

- allow forms in story iframe ([47b0a42](https://github.com/joshbolduc/vscode-story-explorer/commit/47b0a422cbe9219a3c10caafc7cdcae24f97e089))

## 0.1.0 (2021-07-09)

### Features

- initial version ([9a3d537](https://github.com/joshbolduc/vscode-story-explorer/commit/9a3d537943a8db480f0bbd43493da3ffd89afae1))

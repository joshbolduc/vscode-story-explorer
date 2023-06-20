# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.0.0](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.11.2...v1.0.0) (2023-06-20)

### Features

- add support for CSF3 custom story names ([e7a0cf2](https://github.com/joshbolduc/vscode-story-explorer/commit/e7a0cf237ca849792fd7bdf61b15f7084a015a6a))

### Bug Fixes

- default to storybook v7 if version detection fails ([9eb736e](https://github.com/joshbolduc/vscode-story-explorer/commit/9eb736e0fa7bbeae6a3da1b7c1d313e3fe46a139))
- **deps:** update dependency esbuild-wasm to v0.18.5 ([d29908d](https://github.com/joshbolduc/vscode-story-explorer/commit/d29908d83af1b6b5edc8df7de159a30b13c7976d))

### [0.11.2](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.11.1...v0.11.2) (2023-03-25)

### Bug Fixes

- limit workaround for CLI env args ([fc6e83c](https://github.com/joshbolduc/vscode-story-explorer/commit/fc6e83c6fc39c13080cfb3c43b60b8e2438d1bbd))

### [0.11.1](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.11.0...v0.11.1) (2023-03-15)

### Bug Fixes

- update icons ([c905018](https://github.com/joshbolduc/vscode-story-explorer/commit/c905018cfcd0b984e4ca27dd8afead6a108ed54a))

## [0.11.0](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.10.0...v0.11.0) (2023-03-14)

### Features

- support parsing TypeScript, ESM configs ([b6aa138](https://github.com/joshbolduc/vscode-story-explorer/commit/b6aa138ecd3de7ca6e03d007be892bd2989d0dcf)), closes [#756](https://github.com/joshbolduc/vscode-story-explorer/issues/756)

## [0.10.0](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.9.2...v0.10.0) (2023-03-12)

### Features

- add settings to override Storybook autodocs config ([d8b2c6f](https://github.com/joshbolduc/vscode-story-explorer/commit/d8b2c6f9e2d709da5abfe584c487b187deb47eec))

### Bug Fixes

- add workaround for storybook CLI not honoring environment variables ([6eee046](https://github.com/joshbolduc/vscode-story-explorer/commit/6eee046e2cc604a44c76ff28ed3795390ee69966))
- use default docs settings when config can't be read ([8f25702](https://github.com/joshbolduc/vscode-story-explorer/commit/8f25702a9e4dd67016210bb3be83a1bd159a7e31))

### [0.9.2](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.9.1...v0.9.2) (2023-03-11)

### Bug Fixes

- add skeleton MDX language contribution ([67201a9](https://github.com/joshbolduc/vscode-story-explorer/commit/67201a946a21ea2f8cf2ab015d78312c35e8a911))
- avoid confusing outgoing ports with open ports ([41740ab](https://github.com/joshbolduc/vscode-story-explorer/commit/41740abf3babe8f2592c2a1248b73e2628577257))
- combine tree items with the same sanitized value ([0b61a17](https://github.com/joshbolduc/vscode-story-explorer/commit/0b61a17444c8ad2bfaefb22c243bb5e102f30ec5))
- remove non-functional npm args setting ([7b8f209](https://github.com/joshbolduc/vscode-story-explorer/commit/7b8f209029af0dfa45ed15ba6cd6b0813e843aff))

### [0.9.1](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.9.0...v0.9.1) (2023-03-10)

### Bug Fixes

- account for prefixes when suggesting titles ([8447dbb](https://github.com/joshbolduc/vscode-story-explorer/commit/8447dbb97c6b2a407bd1bda63c7dfa570c2437bb))

## [0.9.0](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.8.3...v0.9.0) (2023-03-10)

### Features

- include `*.mdx` in default glob with Storybook 7 ([2c58254](https://github.com/joshbolduc/vscode-story-explorer/commit/2c58254aa0d087e2af7f8fbfbdd284610244483b)), closes [#758](https://github.com/joshbolduc/vscode-story-explorer/issues/758)
- support attached docs ([71f35a6](https://github.com/joshbolduc/vscode-story-explorer/commit/71f35a651c4ac4c76195d57980ef92c386cf04db)), closes [#760](https://github.com/joshbolduc/vscode-story-explorer/issues/760)
- support Storybook 7 autodocs ([02677ec](https://github.com/joshbolduc/vscode-story-explorer/commit/02677ecdc5b17115cd3de3476fb729f41c260510)), closes [#759](https://github.com/joshbolduc/vscode-story-explorer/issues/759)
- support unattached docs ([94682a4](https://github.com/joshbolduc/vscode-story-explorer/commit/94682a41aee48c1b66d91f29ab842a2187d2b54f)), closes [#761](https://github.com/joshbolduc/vscode-story-explorer/issues/761)

### Bug Fixes

- add activation events for `*.mdx` ([133c6b8](https://github.com/joshbolduc/vscode-story-explorer/commit/133c6b88f0d6732b05f0d959003a0fdc649d3c68))

### [0.8.3](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.8.2...v0.8.3) (2023-03-08)

### Bug Fixes

- use folder icon for tree item containing docs ([096d956](https://github.com/joshbolduc/vscode-story-explorer/commit/096d956e6cd9b4f2e7879fb6c2ca68b3d4388f84))

### [0.8.2](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.8.1...v0.8.2) (2023-02-23)

### Bug Fixes

- support parsing JS decorators ([#832](https://github.com/joshbolduc/vscode-story-explorer/issues/832)) ([c1d5450](https://github.com/joshbolduc/vscode-story-explorer/commit/c1d54508e4afe0a0300a659ad62f9f3aa2611462))

### [0.8.1](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.8.0...v0.8.1) (2023-02-20)

### Bug Fixes

- avoid relaunching running tasks ([9d669f4](https://github.com/joshbolduc/vscode-story-explorer/commit/9d669f49c16e1421e2a9deaf5be546d8527340bc))

## [0.8.0](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.7.2...v0.8.0) (2023-02-20)

### Features

- support additional launch strategies ([4b13fd9](https://github.com/joshbolduc/vscode-story-explorer/commit/4b13fd9c138397ae0aa59f23ed478859648da441)), closes [#571](https://github.com/joshbolduc/vscode-story-explorer/issues/571) [#605](https://github.com/joshbolduc/vscode-story-explorer/issues/605)

### [0.7.2](https://github.com/joshbolduc/vscode-story-explorer/compare/v0.7.1...v0.7.2) (2023-02-14)

### Bug Fixes

- always determine config file location ([f36f562](https://github.com/joshbolduc/vscode-story-explorer/commit/f36f56274ccad306a5ef1cd0b12b3e35afb60fbc))

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

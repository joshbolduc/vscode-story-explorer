# Story Explorer

<p align="center">
  <img alt="Story Explorer logo" height="96" width="96" src="icon.png" />
</p>

A VS Code extension that lets you browse and preview stories with [Storybook](https://storybook.js.org), right inside your editor.

**[Install from the Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=joshbolduc.story-explorer)**

![Screenshot of Story Explorer previewing a story](images/screenshot.png)

## Features

**Browse your project's stories via a dedicated sidebar view**. See all of your stories at a glance and quickly jump to their source. You don't even need to start a Storybook server.

**See live previews of your stories directly within your editor**. Focus on one, or open several side-by-side and see how they change as you code. And it works for docs, too. Story Explorer can automatically start a Storybook development server on-demand, or you can point it toward one you launch yourself.

Plus:

- **Open stories and docs via CodeLens**
- **Jump to story source from a story preview** for easy navigation
- **Launch stories in an external browser** when you want the full Storybook environment
- **Get Intellisense suggestions** for story titles

## Settings

### `storyExplorer.codeLens.docs.enabled`

Controls whether to display CodeLens results for docs. When enabled, CodeLens results for docs appear at the top of story files.

### `storyExplorer.codeLens.stories.enabled`

Controls whether to display CodeLens results for stories. When enabled, CodeLens results for stories appear above story definitions.

### `storyExplorer.logLevel`

Log level to use for logging. Logs are available via the Story Explorer output channel in the output panel.

### Options

- `none`: Do not log

- `error`: Log errors only

- `warn`: Log warnings and errors

- `info`: Log general operational information, warnings, and errors

- `debug`: Log debugging information, general operational information, warnings, and errors

### `storyExplorer.server.external.url`

URL of an externally launched and managed Storybook instance, used when `storyExplorer.server.internal.enabled` is disabled. Defaults to `http://localhost:6006`.

### `storyExplorer.server.internal.behavior`

Controls when to automatically start a Storybook development server. This setting only applies when `storyExplorer.server.internal.enabled` is enabled.

### Options

- `immediate`: Start the server automatically when opening the workspace.

- `deferred`: Wait to start the server automatically until a story preview is opened.

### `storyExplorer.server.internal.commandLineArgs`

Array of command line arguments to pass to the `start-storybook` script.

### `storyExplorer.server.internal.enabled`

Controls whether to enable the internal Storybook development server. When unchecked, you will have to run the server externally.

### `storyExplorer.server.internal.environmentVariables`

Object with environment variables that will be added to the Storybook server process.

### `storyExplorer.server.internal.storybookBinaryPath`

Path to the `start-storybook` script used to start a Storybook development server. By default, Story Explorer will attempt to auto-detect the script inside `node_modules`.

### `storyExplorer.storiesGlobs`

Globs specifying the location of stories in the project relative to the workspace root. By default, stories globs are read from the Storybook configuration file. If specified, this takes precedence over the Storybook configuration file.

### `storyExplorer.storiesView.showItemsWithoutStories`

Controls whether to display story kinds in the stories view that do not contain any valid stories. These items do not appear in Storybook.

### `storyExplorer.storybookConfigDir`

Location of the Storybook configuration directory containing `main.js`. By default, Story Explorer will attempt to auto-detect a `.storybook` configuration directory that contains a `main.js` file. If your configuration directory is named something other than `.storybook` or your workspace contains more than one configuration directory, you should manually specify a path to the configuration directory you wish to use.

### `storyExplorer.suggestStoryId`

Controls whether to offer suggestions for story IDs when using `<Story id="..." />` in MDX files. Suggestions are based on the IDs of other stories in the project.

### `storyExplorer.suggestTitle`

Controls whether to offer suggestions for titles when specifying a `Meta` object in CSF or MDX files. Suggestions are based on other titles used in the project.

## Limitations

### Static analysis

Story Explorer uses static analysis to extract stories and metadata from source files. Static analysis is fast and safe, since it doesn't execute arbitrary code.

The downside is its evaluation capabilities are more limited, so it won't handle certain complex expressions that work at runtime.

If you import stories from other files or use complex expressions when defining stories, some of your stories may not be recognized correctly.

To maximize compatibility, avoid using complex expressions and importing from other files.

### CSF and MDX only

Only [Component Story Format](https://storybook.js.org/docs/react/api/csf) (CSF, using CSF 1.0 or [2.0 with hoisted CSF annotations](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#hoisted-csf-annotations)) and [MDX](https://storybook.js.org/docs/react/api/mdx) stories are supported.

The legacy `storiesOf` API is not supported.

### Cross-origin restrictions

Story previews are rendered in an `iframe` embedded in a VS Code `webview`. This imposes some restrictions inherent to the use of cross-origin `iframe`s.

For example, attempts to access `window.top` in a story will cause an exception to be thrown. This can interfere with the official actions addon.

Story Explorer attempts to suppress any uncaught exceptions so that they don't interfere with the preview, but some functionality may not work as expected. You can always open stories in an external browser instead of the built-in preview.

### Limited addon support

Story previews use isolated views of each story. These previews don't include the toolbar or addon panels, so addons that decorate the manager, such as controls, actions, and backgrounds, aren't available.

### Trusted workspaces required

Story Explorer currently doesn't work with [untrusted workspaces](https://github.com/microsoft/vscode/issues/106488).

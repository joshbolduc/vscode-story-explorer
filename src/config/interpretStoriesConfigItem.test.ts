import { describe, expect, it } from 'vitest';
import { Uri } from 'vscode';
import { interpretStoriesConfigItem } from './interpretStoriesConfigItem';

describe('interpretStoriesConfigItem', () => {
  it('uses glob requiring *.stories.* prefix for MDX files when requested', async () => {
    const result = await interpretStoriesConfigItem(
      { directory: '/mock/base' },
      Uri.file('/mock/base/config'),
      { defaultGlobsIncludesAllMdx: false },
    );

    expect(result.files).toMatchInlineSnapshot(
      '"**/*.stories.@(mdx|tsx|ts|jsx|js)"',
    );
  });

  it('uses glob including all *.mdx files when requested', async () => {
    const result = await interpretStoriesConfigItem(
      { directory: '/mock/base' },
      Uri.file('/mock/base/config'),
      { defaultGlobsIncludesAllMdx: true },
    );

    expect(result.files).toMatchInlineSnapshot(
      '"**/*.@(mdx|stories.@(tsx|ts|jsx|js))"',
    );
  });
});

import { readFile } from 'fs/promises';
import { relative, resolve } from 'path';
import { describe, expect, it } from 'vitest';
import { strCompareFn } from '../../src/util/strCompareFn';
import type { TestProjectVersion } from '../util/getTestStoryFiles';
import { getTreeRoots, TreeItemRepresentation } from '../util/getTreeRoots';
import { testBaseDir } from '../util/testBaseDir';

interface StoriesJsonV3Map {
  [id: string]: {
    id: string;
    name: string;
    title: string;
    importPath: string;
    kind: string;
    story: string;
    tags?: string[] | undefined;
    parameters: {
      fileName: string;
      framework: string;
      __id: string;
      __isArgsStory: boolean;
    };
  };
}

interface StoriesJsonV3 {
  v: 3;
  stories: StoriesJsonV3Map;
}

interface StoryTestInfo {
  id: string;
  name: string;
  title: string;
  importPath: string;
}

describe('stories.json', () => {
  const configs: {
    version: TestProjectVersion;
    corrections?: Record<string, Partial<StoryTestInfo>>;
    exclusions?: string[];
  }[] = [
    {
      version: '6',
      corrections: {
        // BUG: name assigned to MDX story importing CSF story is not reflected in
        // imported CSF story
        'example-basic-csf--small': {
          name: 'Story with name, story, body',
        },
        // BUG: importing a CSF story in an MDX file does not honor the CSF
        // storyName
        'example-mdx-importing-csf--basic': {
          name: 'Story name from JS',
        },
      },
    },
    {
      version: '7',
      corrections: {
        // autodocs NYI
        'custom-title-prefix-second-level-mdx-non-stories-mdx-file-with-specified-title--page':
          {
            id: 'custom-title-prefix-second-level-mdx-non-stories-mdx-file-with-specified-title--autodoc',
            name: 'Autodoc',
          },
        'custom-title-prefix-second-level-mdx-plainmarkdown--page': {
          id: 'custom-title-prefix-second-level-mdx-plainmarkdown--autodoc',
          name: 'Autodoc',
        },
        'custom-title-prefix-second-level-mdx-withouttitle--page': {
          id: 'custom-title-prefix-second-level-mdx-withouttitle--autodoc',
          name: 'Autodoc',
        },
        'custom-title-prefix-second-level-mdx-with-specified-title--page': {
          id: 'custom-title-prefix-second-level-mdx-with-specified-title--autodoc',
          name: 'Autodoc',
        },
        'example-mdx-docs-only--page': {
          id: 'example-mdx-docs-only--autodoc',
          name: 'Autodoc',
        },
        'mdx-docs-at-top-level--page': {
          id: 'mdx-docs-at-top-level--autodoc',
          name: 'Autodoc',
        },
        // storyStoreV7 limitations
        'example-csf-v1--v-1-story-name': {
          name: 'V 1 Story Name',
        },
        'example-csf-v1--v-2-v-1-story-name-empty': {
          name: '',
        },
        'example-custom-name--named-via-variable': {
          name: 'Named Via Variable',
        },
        'example-custom-name--interpolated-name': {
          name: 'Interpolated Name',
        },
        'example-custom-name--empty-name': {
          name: '',
        },
        'example-export-styles--normal-export': {
          name: 'NormalExport',
        },
        'example-export-styles--alternative-export-name': {
          name: 'AlternativeExportName',
        },
        'example-export-styles--export-name-overridden': {
          name: 'ExportNameOverridden',
        },
        'test-story-declarations--separate-declarator': {
          name: 'SeparateDeclarator',
        },
        'test-story-declarations--separate-declarator-2': {
          name: 'SeparateDeclarator2',
        },
        'test-story-declarations--separate-function-story': {
          name: 'SeparateFunctionStory',
        },
        'test-story-declarations--separate-function-story-2': {
          name: 'SeparateFunctionStory2',
        },
      },
    },
  ];

  configs.forEach(({ version, corrections, exclusions = [] }) =>
    it(`matches storybook-generated stories.json for v${version}`, async () => {
      const getFlattenedChildren = (
        node: TreeItemRepresentation,
        stories: StoryTestInfo[],
      ) => {
        const entry = node.treeNode.getLeafEntry();
        if (entry) {
          stories.push({
            id: node.item.id!,
            name: entry.name,
            title: entry.storyFile.getTitle()!,
            importPath: `./${relative(
              `/mock/basedir/project/v${version}`,
              entry.storyFile.getUri().path,
            )}`,
          });
        }

        node.children?.forEach((childNode) => {
          getFlattenedChildren(childNode, stories);
        });
      };

      const stories: StoryTestInfo[] = [];
      const rootChildren = await getTreeRoots(version, '.storybook');
      rootChildren.forEach((root) => {
        getFlattenedChildren(root, stories);
      });

      const transformedStoriesJson = stories
        .map((story) => {
          const itemCorrections = corrections?.[story.id];

          // ensure corrections are minimally scoped and not stale
          Object.entries(itemCorrections ?? {}).forEach(
            ([key, correctedValue]) => {
              expect(story[key as keyof typeof story]).not.toStrictEqual(
                correctedValue,
              );
            },
          );

          return { ...story, ...itemCorrections };
        })
        .sort((a, b) => strCompareFn(a.id, b.id));

      // This file is assumed to be generated in advance and up-to-date
      const generatedStoriesJsonStr = await readFile(
        resolve(testBaseDir, 'project', `v${version}`, 'stories.json'),
      );

      const storiesJson = JSON.parse(
        generatedStoriesJsonStr.toString(),
      ) as StoriesJsonV3;

      const receivedIds = transformedStoriesJson.reduce((acc, cur) => {
        acc.add(cur.id);
        return acc;
      }, new Set<string>());
      const referenceStories = Object.values(storiesJson.stories)
        .filter(
          (entry) =>
            (!entry.tags?.includes('autodocs') || receivedIds.has(entry.id)) &&
            !exclusions.some((exclusion) => exclusion === entry.id),
        )
        .map<StoryTestInfo>((story) => ({
          id: story.id,
          name: story.name,
          title: story.title,
          importPath: story.importPath,
        }))
        .sort((a, b) => strCompareFn(a.id, b.id));

      expect(transformedStoriesJson.map((item) => item.id)).toStrictEqual(
        referenceStories.map((item) => item.id),
      );
    }),
  );
});

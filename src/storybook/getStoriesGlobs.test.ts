import { getStoriesGlobs } from './getStoriesGlobs';

const mockGlobs = ['glob1', 'glob2', 'glob3'] as const;

describe('getStoriesGlobs', () => {
  it('handles string array', async () => {
    expect(await getStoriesGlobs(mockGlobs.slice())).toEqual(mockGlobs);
  });

  it('handles factory function', async () => {
    expect(await getStoriesGlobs(() => mockGlobs.slice())).toEqual(mockGlobs);
  });

  it('handles Promise for string array', async () => {
    expect(await getStoriesGlobs(Promise.resolve(mockGlobs.slice()))).toEqual(
      mockGlobs,
    );
  });

  it('handles async factory function', async () => {
    expect(
      await getStoriesGlobs(() => Promise.resolve(mockGlobs.slice())),
    ).toEqual(mockGlobs);
  });
});

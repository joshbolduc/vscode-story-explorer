module.exports = {
  stories: [
    {
      directory: '../src/autoTitle',
      titlePrefix: 'Custom title prefix/Second level',
    },
    '../src/**/*.stories.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: ['@storybook/addon-essentials'],
  core: {
    builder: 'webpack5',
  },
  features: {
    previewMdx2: true,
  },
};

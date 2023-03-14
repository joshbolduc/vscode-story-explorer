export default {
  stories: () =>
    Promise.resolve([
      {
        directory: '../src/autoTitle',
        titlePrefix: 'Custom title prefix/Second level',
      },
      '../src/features/**/*',
      '../src/stories/**/*.mdx',
      '../src/stories/**/*.stories.@(js|jsx|ts|tsx)',
    ]),
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: true,
    defaultName: 'Autodoc',
  },
};

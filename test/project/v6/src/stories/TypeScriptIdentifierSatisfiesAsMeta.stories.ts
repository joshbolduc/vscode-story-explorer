import { Meta } from '@storybook/react';

export const TypeScriptStory = () =>
  'Story for TS with identifier using satisfies and as Meta, exported';

const meta = {
  title: 'Test/TypeScript/Identifier Satisfies as Meta',
} satisfies Meta as Meta;

export default meta;

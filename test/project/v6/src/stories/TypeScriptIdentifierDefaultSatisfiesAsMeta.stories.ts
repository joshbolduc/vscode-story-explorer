import { Meta } from '@storybook/react';

export const TypeScriptStory = () =>
  'Story for TS with exported identifier satisfies Meta';

const meta = {
  title: 'Test/TypeScript/Identifier exported satisfies as Meta',
};

export default meta satisfies Meta as Meta;

import { Meta, Story } from '@storybook/react';

export const TypeScriptStory = () => 'Story in TypeScript';

export const TypeScriptTypedStory: Story = () => (
  <div>Typed story in TypeScript</div>
);

export const TypeScriptTypedGenericStory: Story<{}> = () => (
  <div>Generically typed story in TypeScript</div>
);

export const TypeScriptTypeAssertionStory = (() => (
  <div>Type assertion story in TypeScript</div>
)) as Story;

export default {
  title: 'Test/TypeScript/Sample',
} as Meta;

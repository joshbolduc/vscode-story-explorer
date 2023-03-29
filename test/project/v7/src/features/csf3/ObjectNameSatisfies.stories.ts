import { StoryObj } from '@storybook/react';
import { Sample } from '../../components/Sample';

export default {
  component: Sample,
};

export const A = {
  name: 'Apple',
} satisfies StoryObj;

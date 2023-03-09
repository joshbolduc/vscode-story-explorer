import React from 'react';
import { Sample } from '../components/Sample';

export const Basic = (args) => <Sample {...args} />;
Basic.args = {
  children: 'Basic',
};
Basic.storyName = 'Story name from JS';

export const Basic2 = (args) => <Sample {...args} />;
Basic2.args = {
  children: 'Basic 2',
};
Basic2.storyName = 'Story name 2 from JS';

export const Basic3 = (args) => <Sample {...args} />;
Basic3.args = {
  children: 'Basic 3',
};

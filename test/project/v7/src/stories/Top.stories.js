import React from 'react';

import { Sample } from '../components/Sample';

export default {
  title: 'Top',
  component: Sample,
};

const Template = (args) => <Sample {...args} />;

export const TopLevelStory = Template.bind({});
TopLevelStory.args = {
  children: 'Top level story',
};

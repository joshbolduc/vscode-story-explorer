import React from 'react';

import { Sample } from '../components/Sample';

export default {
  title: 'Example/With Same Name/Same Name',
  component: Sample,
};

const Template = (args) => <Sample {...args} />;

export const NestedStory = Template.bind({});
NestedStory.args = {
  children: 'Nested same name story',
};

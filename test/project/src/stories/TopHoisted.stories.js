import React from 'react';

import { Sample } from '../components/Sample';

export default {
  title: 'Top Hoisted',
  component: Sample,
};

const Template = (args) => <Sample {...args} />;

export const TopHoisted = Template.bind({});
TopHoisted.args = {
  children: 'Top level hoisted story',
};

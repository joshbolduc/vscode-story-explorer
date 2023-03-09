import React from 'react';

import { Sample } from '../components/Sample';

export default {
  title: 'Example/Basic CSF',
  component: Sample,
  args: {
    color: 'blue',
  },
};

const Template = (args) => <Sample {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: 'Primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: 'Secondary',
};

export const Large = Template.bind({});
Large.args = {
  size: 24,
  children: 'Large',
};

export const Small = Template.bind({});
Small.args = {
  size: 12,
  children: 'Small',
};

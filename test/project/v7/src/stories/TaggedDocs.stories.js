import React from 'react';

import { Sample } from '../components/Sample';

export default {
  title: 'Example/Tagged autodocs',
  component: Sample,
  args: {
    color: 'blue',
  },
  tags: ['autodocs'],
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

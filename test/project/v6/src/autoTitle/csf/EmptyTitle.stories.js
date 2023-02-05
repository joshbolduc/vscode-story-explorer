import React from 'react';

import { Sample } from '../../components/Sample';

export default {
  title: '',
};

const Template = (args) => <Sample {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: 'Story with empty title and prefix',
};

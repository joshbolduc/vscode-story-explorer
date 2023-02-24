import React from 'react';

import { Sample } from '../../components/Sample';

const Template = (args) => <Sample {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: 'No default export',
};

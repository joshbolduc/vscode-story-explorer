import React from 'react';

import { Sample } from '../../../components/Sample';

export default {
  component: Sample,
};

const Template = (args) => <Sample {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: 'Nested index filename',
};

import React from 'react';

import { Sample } from '../../components/Sample';

const interpolation = 'Interpolation';

export default {
  title: `Example/Title ${interpolation}`,
  component: Sample,
};

const Template = (args) => <Sample {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: 'Interpolation/Sample',
};

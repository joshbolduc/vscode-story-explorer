import React from 'react';

import { Sample } from '../../components/Sample';

export default {};

const Template = (args) => <Sample {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: 'Empty default export',
};

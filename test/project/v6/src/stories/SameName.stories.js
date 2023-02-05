import React from 'react';

import { Sample } from '../components/Sample';

export default {
  title: 'Example/With Same Name',
  component: Sample,
};

const Template = (args) => <Sample {...args} />;

export const SameName = Template.bind({});
SameName.args = {
  children: 'Same name story',
};

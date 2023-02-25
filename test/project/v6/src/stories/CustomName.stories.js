import React from 'react';

import { Sample } from '../components/Sample';

export default {
  title: 'Example/Custom Name',
  component: Sample,
  args: {
    children: 'Default content',
    color: 'orange',
  },
};

const Template = (args) => <Sample {...args} />;

export const CustomName = Template.bind({});
CustomName.args = {
  children: 'Expected name: Custom story name',
};
CustomName.storyName = 'Custom story name';

export const Overridden = Template.bind({});
Overridden.args = {
  children: 'Expected name: Custom story name override',
};
Overridden.storyName = 'Custom story name';
Overridden.storyName = 'Custom story name override';

export const NamedViaVariable = Template.bind({});
NamedViaVariable.args = {
  children: 'Expected name: Custom story name var',
};
const storyName = 'Custom story name var';
NamedViaVariable.storyName = storyName;

export const InterpolatedName = Template.bind({});
InterpolatedName.storyName = `${storyName} in template string`;

export const EmptyName = Template.bind({});
EmptyName.storyName = '';

export const LeadingWhitespace = Template.bind({});
LeadingWhitespace.storyName = '     Leading whitespace';

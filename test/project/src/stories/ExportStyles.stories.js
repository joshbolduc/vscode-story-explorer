import React from 'react';

import { Sample } from '../components/Sample';

export default {
  title: 'Example/Export Styles',
  component: Sample,
  args: {
    color: 'green',
  },
};

const Template = (args) => <Sample {...args} />;

const NormalExport = Template.bind({});
NormalExport.args = {
  children: 'Export Style/Normal',
};

const ExportedAs = Template.bind({});
ExportedAs.args = {
  children: 'Export Style/Exported as',
};

const ExportedAsWithStoryName = Template.bind({});
ExportedAsWithStoryName.args = {
  children: 'Export Style/Story name takes priority over modified export name',
};
ExportedAsWithStoryName.storyName = 'Override name 3';

export {
  NormalExport,
  ExportedAs as AlternativeExportName,
  ExportedAsWithStoryName as ExportNameOverridden,
};

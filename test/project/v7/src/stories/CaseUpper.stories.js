import React from 'react';
import { Sample } from '../components/Sample';

export const Basic = (args) => <Sample {...args} />;
Basic.args = {
  children: 'Basic',
};

export default {
  title: 'Example/CAS-ING/Upper',
};

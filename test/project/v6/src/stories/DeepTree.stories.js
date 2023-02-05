import { Sample } from '../components/Sample';

export default {
  title: 'Example/Deep/Tree/With/Several/Kinds',
  component: Sample,
};

const Template = (args) => <Sample {...args} />;

export const Story = Template.bind({});
Story.args = {
  children: 'Deep hierarchy',
};

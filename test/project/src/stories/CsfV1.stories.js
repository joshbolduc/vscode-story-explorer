export default {
  title: 'Example/CSF v1',
};

export const V1StoryName = () =>
  'CSF v1 renamed story: should be "Renamed via non-hoisted story"';
V1StoryName.story = {
  name: 'Renamed via non-hoisted story',
};

export const V2V1StoryName = () =>
  'CSF v2 renamed story overrides v1: should be "v2 name override"';
V2V1StoryName.story = {
  name: 'v1 name should be overridden',
};
V2V1StoryName.storyName = 'v2 name override';

export const V2V1StoryNameEmpty = () =>
  'Uses generated story name: should be "V 2 V 1 Story Name Empty"';
V2V1StoryNameEmpty.story = {
  name: 'v1 name should be ignored',
};
V2V1StoryNameEmpty.storyName = '';

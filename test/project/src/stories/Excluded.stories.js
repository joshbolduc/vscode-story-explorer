export const excludedExport = () => 'Story for excluded export';
export const otherExport = () => 'Story for other export';

export default {
  title: 'Test/Exclusions/Excluded',
  excludeStories: ['excludedExport'],
};

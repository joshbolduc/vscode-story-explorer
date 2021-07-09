export const includedExport = () => 'Story for included export';
export const otherExport = () => 'Story for other export';

export default {
  title: 'Test/Exclusions/Included',
  includeStories: ['includedExport'],
};

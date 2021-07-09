const meta = {
  title: 'Test/Story Declarations',
};

export default meta;

export const ConstDeclarator = () => 'Story for const declarator';

const SeparateDeclarator = () => 'Story for separate declarator';
const SeparateDeclarator2 = () =>
  'Story for separate declarator with different name';
SeparateDeclarator2.storyName = 'Separate declarator with story name';
export { SeparateDeclarator, SeparateDeclarator2 };

export const MultipleOne = () => 'Multiple declarations story one',
  MultipleTwo = () => 'Multiple declarations story two';

MultipleTwo.storyName = 'Multiple two (given name)';

export function FunctionStory() {
  return 'Story for renamed function story';
}
FunctionStory.storyName = 'Renamed Function Story';

function SeparateFunctionStory() {
  return 'Story for separate function story';
}

function SeparateFunctionStory2() {
  return 'Story for separate function story with different name';
}
SeparateFunctionStory2.storyName = 'Separate function story with story name';

export { SeparateFunctionStory, SeparateFunctionStory2 };

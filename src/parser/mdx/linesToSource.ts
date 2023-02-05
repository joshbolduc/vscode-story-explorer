import type { Position } from 'unist';

export const linesToSource = (lines: { value: string; position: Position }[]) =>
  lines
    .reduce<string[]>((output, { value, position }) => {
      const line = output.length;
      const desiredLine = position.start.line - 1;

      for (let i = line; i < desiredLine; i++) {
        output.push('');
      }

      output.push(...value.split('\n'));

      return output;
    }, [])
    .join('\n');

import { readFileSync } from 'fs';
import { join } from 'path';

const contentsAsStr = readFileSync(
  join(__dirname, '..', 'package.json'),
).toString();

const packageJson = JSON.parse(
  contentsAsStr,
) as typeof import('../package.json');

const settings = packageJson.contributes.configuration.properties;

const output = Object.entries(settings)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, value]) => {
    const paragraphs = [
      `### \`${key}\``,
      value.markdownDescription?.replace(
        /`#([^#]+)#`/g,
        (str, matchGroup: string) => `\`${matchGroup}\``,
      ),
    ];

    if ('enum' in value) {
      paragraphs.push('### Options');
      value.enum.forEach((enumName, i) => {
        const description = value.markdownEnumDescriptions[i];

        paragraphs.push(
          `- \`${enumName}\`${description ? `: ${description}` : ''}`,
        );
      });
    }

    return paragraphs.join('\n\n');
  });

console.log(output.join('\n\n'));

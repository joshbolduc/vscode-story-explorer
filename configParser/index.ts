import { parse } from '../src/config/parse';

const main = async () => {
  const [, , configFilePath] = process.argv;
  if (typeof configFilePath !== 'string' || !process.send) {
    return;
  }

  const parsedConfig = await parse(configFilePath);

  process.send(parsedConfig);
};

if (require.main === module) {
  main().catch(() => {
    // no-op
  });
}

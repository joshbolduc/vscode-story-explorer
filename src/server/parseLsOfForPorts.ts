import { isDefined } from '../util/guards/isDefined';

export const parseLsOfForPorts = (stdout: string) => {
  const lines = stdout.trim();
  const matches = [...lines.matchAll(/^n[^(?:->)]+:([0-9]+)$/gm)];

  return matches
    .map(([, port]) => port)
    .filter(isDefined)
    .map((p) => parseInt(p));
};

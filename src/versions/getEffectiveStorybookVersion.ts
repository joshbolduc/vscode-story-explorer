import { intersects, satisfies, valid } from 'semver';
import { EARLIEST_VERSION, notableVersions } from './versions';

export const getEffectiveStorybookVersion = (versionOrRange: string) => {
  // If it's a literal version, use it as-is
  if (valid(versionOrRange)) {
    return versionOrRange;
  }

  // If it's a range that can be satisfied by a notable version, use that
  // version
  const matchByRange = notableVersions.find((notableVersion) => {
    return satisfies(notableVersion, versionOrRange);
  });

  if (matchByRange) {
    return matchByRange;
  }

  // If the range cannot be satisfied by a notable version, find the first
  // notable version that could plausibly correspond to a version in the given
  // range
  const matchByIntersection = notableVersions.find((notableVersion) => {
    const notableRange = `>=${notableVersion}`;
    return intersects(versionOrRange, notableRange);
  });

  // If no notable version was a fit, the range is too old, so fall back to the
  // oldest supported version
  return matchByIntersection ?? EARLIEST_VERSION;
};

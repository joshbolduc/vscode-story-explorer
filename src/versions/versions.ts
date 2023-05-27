export const VERSION_6_x = '6.0.0';
export const VERSION_7_x_ALPHA = '7.0.0-alpha.0';
export const VERSION_7_x = '7.0.0';

export const EARLIEST_VERSION = VERSION_6_x;

// Versions are sorted according to preference when matching arbitrary ranges.
// Unstable versions come last so that they are only matched if the given range
// cannot be satisfied by a stable version (e.g., when the range's minimum
// version is a beta release).

export const notableVersions = [
  // Stable versions, newest first
  VERSION_7_x,
  VERSION_6_x,
  // Future/unstable versions last
] as const;

import { describe, expect, it } from 'vitest';
import { getEffectiveStorybookVersion } from './getEffectiveStorybookVersion';

describe('getEffectiveStorybookVersion', () => {
  it('returns literal versions as-is', () => {
    expect(getEffectiveStorybookVersion('6.5.0')).toBe('6.5.0');
    expect(getEffectiveStorybookVersion('6.2.1')).toBe('6.2.1');
    expect(getEffectiveStorybookVersion('1.2.3')).toBe('1.2.3');
    expect(getEffectiveStorybookVersion('99.9.9-alpha.23')).toBe(
      '99.9.9-alpha.23',
    );
  });

  it('returns most compatible notable version when given range', () => {
    expect(getEffectiveStorybookVersion('^6.0.0')).toBe('6.0.0');
    expect(getEffectiveStorybookVersion('~6.2.0')).toBe('6.0.0');
    expect(getEffectiveStorybookVersion('>= 4')).toBe('7.0.0');
    expect(getEffectiveStorybookVersion('~6.0.0-alpha.30 <6.0.0')).toBe(
      '6.0.0',
    );
    expect(getEffectiveStorybookVersion('*')).toBe('7.0.0');
    expect(getEffectiveStorybookVersion('^7.0.0-alpha.0')).toBe('7.0.0');
    expect(getEffectiveStorybookVersion('^7.0.0-alpha.53')).toBe('7.0.0');
    expect(getEffectiveStorybookVersion('^7.0.0-beta.12')).toBe('7.0.0');
    expect(getEffectiveStorybookVersion('^5.0.0')).toBe('6.0.0');
    expect(getEffectiveStorybookVersion('^9.0.0')).toBe('7.0.0');
  });
});

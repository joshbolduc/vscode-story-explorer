import { describe, expect, it } from 'vitest';
import { parseLsOfForPorts } from './parseLsOfForPorts';

describe('parseLsOfForPorts', () => {
  it('returns open port when present in output', () => {
    const mockOutput = `p28195
f157
n*:51142
f158
n192.168.12.34:51147->127.9.9.9:443`;

    expect(parseLsOfForPorts(mockOutput)).toStrictEqual([51142]);
  });

  it('returns multiple open ports when present in output', () => {
    const mockOutput = `p28195
f157
n*:51142
f158
n192.168.12.34:51147->127.9.9.9:443
f159
n127.0.0.1:51149`;

    expect(parseLsOfForPorts(mockOutput)).toStrictEqual([51142, 51149]);
  });

  it('returns empty array when no ports are open', () => {
    const mockOutput = `p28195
f158
n192.168.12.34:51147->127.9.9.9:443`;

    expect(parseLsOfForPorts(mockOutput)).toStrictEqual([]);
  });
});

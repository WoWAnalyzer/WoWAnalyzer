import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { decodeCombatLogLine } from '../LocalCombatLogParser';

const fixtures = [
  {
    path: 'derived/current-retail-samples.log',
    sha256: '40435c057965042381ace7c61b3da0ac79c12ee3865a5a34e4517765301cfc7a',
  },
  {
    path: 'derived/encounter-envelope.log',
    sha256: 'df213308032c6b2845284cc6fecebee3aa59cc876706fa35aece48e7fb37d18a',
  },
  {
    path: 'synthetic/external-effect.log',
    sha256: 'aac4163adc6eed5d3bd775b4b68f3c3e96a164bc806066aa91c5014f26c21263',
  },
  {
    path: 'synthetic/missing-ownership.log',
    sha256: '62399b9c68645db05cf58bde640137ae1e8dfa774834f6157afc2eebe8a7cc95',
  },
] as const;

describe('target-dummy compact fixtures', () => {
  it.each(fixtures)('keeps $path compact, decodable, and review-stable', ({ path, sha256 }) => {
    const fixturePath = resolve(dirname(fileURLToPath(import.meta.url)), 'test-fixtures', path);
    const contents = readFileSync(fixturePath, 'utf8');
    const lines = contents.trimEnd().split('\n');

    expect(lines.length).toBeLessThanOrEqual(5);
    expect(createHash('sha256').update(contents).digest('hex')).toBe(sha256);
    for (const line of lines) {
      expect(decodeCombatLogLine(line).length).toBeGreaterThanOrEqual(3);
    }
  });
});

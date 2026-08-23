import type Report from 'parser/core/Report';
import { i18n } from '@lingui/core';

import makeAnalyzerUrl from './makeAnalyzerUrl';

const report = {
  code: 'local-uuid',
  locator: { kind: 'local', id: 'local-uuid' },
  fights: [{ id: 1, name: 'First fight' }],
  friendlies: [{ id: 7, name: 'Ada' }],
} as Report;

describe('makeAnalyzerUrl', () => {
  beforeAll(() => {
    i18n.load('en', {});
    i18n.activate('en');
  });

  it('keeps local reports and their player links under the local route', () => {
    expect(makeAnalyzerUrl(report)).toBe('/local/local-uuid');
    expect(makeAnalyzerUrl(report, 1, 7)).toMatch(/^\/local\/local-uuid\/1-/);
    expect(makeAnalyzerUrl(report, 1, 7)).not.toContain('/report/');
  });
});

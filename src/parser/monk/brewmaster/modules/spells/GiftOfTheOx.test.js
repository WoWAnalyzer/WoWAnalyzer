import { loadLog, parseLog } from 'parser/core/tests/log-tools';
import CombatLogParser from '../../CombatLogParser';
import GiftOfTheOx from './GiftOfTheOx';

describe('GiftOfTheOx', () => {
  let parser = null;
  beforeAll(() => {
    return loadLog('brm-example').then(_log => {
      parser = parseLog(CombatLogParser, _log);
    });
  });

  it('should have wdps and agility healing sum to totalHealing', () => {
    const gotox = parser.getModule(GiftOfTheOx);
    expect(Math.abs(gotox._baseAgiHealing + gotox.wdpsBonusHealing + gotox.agiBonusHealing - gotox.totalHealing)).toBeLessThan(1e-6);
  });
});

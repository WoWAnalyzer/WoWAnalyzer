import { baseDodge } from './MasteryValue.js';

describe('MasteryValue', function() {
  it('should correctly estimate base dodge %', function() {
    function roundDodge(dodge) {
      return Math.floor(dodge * 1e4) / 1e4;
    }
    expect(roundDodge(baseDodge(5435))).toBe(0.1386);
    expect(roundDodge(baseDodge(5084))).toBe(0.1323);
    expect(roundDodge(baseDodge(4849))).toBe(0.1281);
    expect(roundDodge(baseDodge(4306))).toBe(0.1181);
    expect(roundDodge(baseDodge(3681))).toBe(0.1064);
  });
});

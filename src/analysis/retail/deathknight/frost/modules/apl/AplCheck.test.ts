import TALENTS from 'common/TALENTS/deathknight';
import Combatant from 'parser/core/Combatant';
import { PlayerInfo, TargetType } from 'parser/shared/metrics/apl';

import { FROST_APL_RULE_IDS, frostApl } from './AplCheck';

function infoWithTalents(...talentIds: number[]): PlayerInfo {
  const selected = new Set(talentIds);
  return {
    combatant: {
      hasTalent: (talent: { id: number }) => selected.has(talent.id),
    } as unknown as Combatant,
  } as unknown as PlayerInfo;
}

describe('Frost 12.1 APL construction', () => {
  it('uses unique stable IDs for every generated rule', () => {
    const apl = frostApl(
      infoWithTalents(
        TALENTS.REAPERS_MARK_TALENT.id,
        TALENTS.BREATH_OF_SINDRAGOSA_TALENT.id,
        TALENTS.FROSTWYRMS_FURY_TALENT.id,
        TALENTS.FROSTSCYTHE_TALENT.id,
        TALENTS.FROSTBANE_TALENT.id,
        TALENTS.SHATTERING_BLADE_TALENT.id,
      ),
    );
    const ids = apl.rules.map((rule) => rule.id);

    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('adds Deathbringer and Breath rules only for matching builds', () => {
    const rider = frostApl(infoWithTalents(TALENTS.FROSTSCYTHE_TALENT.id));
    const deathbringerBreath = frostApl(
      infoWithTalents(
        TALENTS.REAPERS_MARK_TALENT.id,
        TALENTS.BREATH_OF_SINDRAGOSA_TALENT.id,
        TALENTS.FROSTSCYTHE_TALENT.id,
      ),
    );

    expect(rider.rules.some((rule) => rule.id === FROST_APL_RULE_IDS.mark)).toBe(false);
    expect(rider.rules.some((rule) => rule.id === FROST_APL_RULE_IDS.breath)).toBe(false);
    expect(deathbringerBreath.rules.some((rule) => rule.id === FROST_APL_RULE_IDS.mark)).toBe(true);
    expect(deathbringerBreath.rules.some((rule) => rule.id === FROST_APL_RULE_IDS.breath)).toBe(
      true,
    );
  });

  it('keeps AoE and single-target proc alternatives in one source-variant rule', () => {
    const apl = frostApl(
      infoWithTalents(TALENTS.FROSTSCYTHE_TALENT.id, TALENTS.SHATTERING_BLADE_TALENT.id),
    );
    const procRule = apl.rules.find((rule) => rule.id === FROST_APL_RULE_IDS.procSpend);

    expect(procRule?.spell.type).toBe(TargetType.SpellList);
    if (procRule?.spell.type !== TargetType.SpellList) {
      throw new Error('Expected the proc rule to contain source-supported alternatives');
    }
    expect(procRule.spell.target.map((spell) => spell.id)).toContain(TALENTS.FROSTSCYTHE_TALENT.id);
    expect(procRule.spell.target.map((spell) => spell.id)).toContain(TALENTS.OBLITERATE_TALENT.id);
  });
});

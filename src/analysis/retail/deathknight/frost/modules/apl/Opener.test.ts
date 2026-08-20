import TALENTS from 'common/TALENTS/deathknight';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { CastEvent, EventType } from 'parser/core/Events';

import { FROST_OPENER_IDS, matchOpener, openerVariants } from './Opener';

const cast = (timestamp: number, spell: { id: number; name: string; icon: string }): CastEvent => ({
  timestamp,
  type: EventType.Cast,
  ability: {
    guid: spell.id,
    name: spell.name,
    abilityIcon: spell.icon,
    type: MAGIC_SCHOOLS.ids.FROST,
  },
  sourceID: 1,
  sourceIsFriendly: true,
  targetID: 2,
  targetIsFriendly: false,
});

describe('Frost opener matcher', () => {
  it('accepts off-GCD actions in either order inside a stage', () => {
    const variants = openerVariants({ deathbringer: false, breath: true, frostwyrm: true });
    const result = matchOpener(
      [
        cast(0, TALENTS.OBLITERATE_TALENT),
        cast(100, TALENTS.EMPOWER_RUNE_WEAPON_TALENT),
        cast(1500, TALENTS.FROSTWYRMS_FURY_TALENT),
        cast(1500, TALENTS.BREATH_OF_SINDRAGOSA_TALENT),
        cast(1500, TALENTS.PILLAR_OF_FROST_TALENT),
      ],
      variants,
    );

    expect(result.passed).toBe(true);
    expect(result.variant.id).toBe(FROST_OPENER_IDS.riderBreathMethod);
    expect(result.variant.label).toBe('Method — Rider Breath opener');
  });

  it('accepts the distinct Deathbringer Wowhead ordering', () => {
    const variants = openerVariants({ deathbringer: true, breath: true, frostwyrm: true });
    const result = matchOpener(
      [
        cast(0, TALENTS.EMPOWER_RUNE_WEAPON_TALENT),
        cast(100, TALENTS.REAPERS_MARK_TALENT),
        cast(1500, TALENTS.PILLAR_OF_FROST_TALENT),
        cast(1500, TALENTS.BREATH_OF_SINDRAGOSA_TALENT),
        cast(3000, TALENTS.OBLITERATE_TALENT),
        cast(4500, TALENTS.FROSTWYRMS_FURY_TALENT),
      ],
      variants,
    );

    expect(result.passed).toBe(true);
    expect(result.variant.id).toBe(FROST_OPENER_IDS.deathbringerBreathWowhead);
  });

  it('reports progress through the closest variant when ordering is wrong', () => {
    const variants = openerVariants({ deathbringer: false, breath: false, frostwyrm: true });
    const result = matchOpener(
      [
        cast(0, TALENTS.EMPOWER_RUNE_WEAPON_TALENT),
        cast(1500, TALENTS.FROSTWYRMS_FURY_TALENT),
        cast(3000, TALENTS.OBLITERATE_TALENT),
      ],
      variants,
    );

    expect(result.passed).toBe(false);
    expect(result.matchedStages).toBe(1);
    expect(result.stageResults).toEqual([
      {
        expected: [TALENTS.EMPOWER_RUNE_WEAPON_TALENT.id],
        actual: [
          expect.objectContaining({
            ability: expect.objectContaining({ guid: TALENTS.EMPOWER_RUNE_WEAPON_TALENT.id }),
          }),
        ],
        matched: true,
      },
      {
        expected: [TALENTS.PILLAR_OF_FROST_TALENT.id, TALENTS.FROSTWYRMS_FURY_TALENT.id],
        actual: [
          expect.objectContaining({
            ability: expect.objectContaining({ guid: TALENTS.FROSTWYRMS_FURY_TALENT.id }),
          }),
        ],
        matched: false,
      },
    ]);
    expect(result.trackedCasts.map((event) => event.ability.guid)).toEqual([
      TALENTS.EMPOWER_RUNE_WEAPON_TALENT.id,
      TALENTS.FROSTWYRMS_FURY_TALENT.id,
    ]);
  });
});

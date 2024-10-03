import Combatant from 'parser/core/Combatant';
import { Apl, build, Rule } from 'parser/shared/metrics/apl';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import SpellLink from 'interface/SpellLink';
import { and, buffPresent, debuffMissing, describe } from 'parser/shared/metrics/apl/conditions';
import { MaxStacksMSW, getSpenderBlock } from './Conditions';

export function stormbringer(combatant: Combatant): Apl {
  const rules: Rule[] = [
    /** Tempest with 10 MSW */
    {
      spell: SPELLS.TEMPEST_CAST,
      condition: describe(and(buffPresent(SPELLS.TEMPEST_BUFF), MaxStacksMSW), () => (
        <>
          available and at 10 <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks
        </>
      )),
    },
    /** Windstrike during ascendance */
    {
      spell: SPELLS.WINDSTRIKE_CAST,
      condition: describe(
        buffPresent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
        () => (
          <>
            on cooldown during <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />
          </>
        ),
        '',
      ),
    },
    /** common MSW spender block */
    ...getSpenderBlock(combatant),
  ];

  /** For Lava Lash/Hot Hand builds, have higher priority for  */
  if (combatant.hasTalent(TALENTS.HOT_HAND_TALENT)) {
    rules.push(
      {
        spell: SPELLS.FLAME_SHOCK,
        condition: debuffMissing(SPELLS.FLAME_SHOCK),
      },
      {
        spell: TALENTS.LAVA_LASH_TALENT,
        condition: buffPresent(SPELLS.HOT_HAND_BUFF),
      },
      TALENTS.ICE_STRIKE_TALENT,
      {
        spell: TALENTS.FROST_SHOCK_TALENT,
        condition: buffPresent(SPELLS.HAILSTORM_BUFF),
      },
      TALENTS.LAVA_LASH_TALENT,
      TALENTS.STORMSTRIKE_TALENT,
    );
  } else {
    rules.push(
      TALENTS.STORMSTRIKE_TALENT,
      TALENTS.ICE_STRIKE_TALENT,
      {
        spell: TALENTS.FROST_SHOCK_TALENT,
        condition: buffPresent(SPELLS.HAILSTORM_BUFF),
      },
      {
        spell: SPELLS.FLAME_SHOCK,
        condition: debuffMissing(SPELLS.FLAME_SHOCK),
      },
      TALENTS.LAVA_LASH_TALENT,
      TALENTS.CRASH_LIGHTNING_TALENT,
      SPELLS.FLAME_SHOCK,
    );
  }

  return build(rules);
}

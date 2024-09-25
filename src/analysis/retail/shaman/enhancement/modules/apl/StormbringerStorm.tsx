import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import SpellLink from 'interface/SpellLink';
import Combatant from 'parser/core/Combatant';
import { Apl, build, Rule } from 'parser/shared/metrics/apl';
import {
  and,
  buffPresent,
  debuffMissing,
  describe,
  hasTalent,
  not,
} from 'parser/shared/metrics/apl/conditions';
import { getSpenderBlock, MaxStacksMSW } from './Conditions';

export function stormbringerStorm(combatant: Combatant): Apl {
  const rules: Rule[] = [
    {
      spell: SPELLS.TEMPEST_CAST,
      condition: describe(and(buffPresent(SPELLS.TEMPEST_BUFF), MaxStacksMSW), () => (
        <>
          available and at 10 <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks
        </>
      )),
    },
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
    ...getSpenderBlock(combatant),
    {
      spell: TALENTS.STORMSTRIKE_TALENT,
      condition: describe(
        and(
          hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT),
          not(buffPresent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT)),
        ),
        () => (
          <>
            to fish for <SpellLink spell={TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT} />
          </>
        ),
        '',
      ),
    },
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
  ];

  // frost shock is slightly elevated if the hailstorm talent is selected and buff is active
  combatant.hasTalent(TALENTS.HAILSTORM_TALENT) &&
    rules.push({
      spell: TALENTS.FROST_SHOCK_TALENT,
      condition: buffPresent(SPELLS.HAILSTORM_BUFF),
    });

  rules.push(
    TALENTS.SUNDERING_TALENT,
    {
      spell: SPELLS.FLAME_SHOCK,
      condition: debuffMissing(SPELLS.FLAME_SHOCK),
    },
    TALENTS.LAVA_LASH_TALENT,
  );

  // frost shock is filler without hailstorm
  !combatant.hasTalent(TALENTS.HAILSTORM_TALENT) && rules.push(TALENTS.FROST_SHOCK_TALENT);

  return build(rules);
}

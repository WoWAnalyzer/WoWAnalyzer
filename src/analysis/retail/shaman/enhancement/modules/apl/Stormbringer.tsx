import Combatant from 'parser/core/Combatant';
import { Apl, build, Rule } from 'parser/shared/metrics/apl';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import SpellLink from 'interface/SpellLink';
import {
  and,
  buffPresent,
  buffStacks,
  describe,
  spellCharges,
} from 'parser/shared/metrics/apl/conditions';
import {
  getSpenderBlock,
  MINIMUM_MAELSTROM_WEAPON_SPEND_STACKS,
  minimumMaelstromWeaponStacks,
} from './Conditions';

export function stormbringer(combatant: Combatant): Apl {
  const iceStrikeRule = combatant.hasTalent(TALENTS.ICE_STRIKE_1_ENHANCEMENT_TALENT)
    ? {
        spell: SPELLS.ICE_STRIKE_1_CAST,
        condition: buffPresent(SPELLS.ICE_STRIKE_1_USABLE_BUFF),
      }
    : TALENTS.ICE_STRIKE_2_ENHANCEMENT_TALENT;

  const rules: Rule[] = [
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
    {
      spell: SPELLS.TEMPEST_CAST,
      condition: describe(
        and(
          buffPresent(SPELLS.TEMPEST_BUFF),
          minimumMaelstromWeaponStacks(MINIMUM_MAELSTROM_WEAPON_SPEND_STACKS),
        ),
        () => (
          <>
            available and at least 8 <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks
          </>
        ),
      ),
    },
    /** common MSW spender block */
    ...getSpenderBlock(combatant),
    {
      spell: SPELLS.STORMSTRIKE_CAST,
      condition: spellCharges(SPELLS.STORMSTRIKE_CAST, { atLeast: 2, atMost: 2 }),
    },
    {
      spell: TALENTS.CRASH_LIGHTNING_TALENT,
      condition: buffStacks(SPELLS.TWW_S2_ELECTROSTATIC_WAGER, { atLeast: 1 }),
    },
    {
      spell: SPELLS.VOLTAIC_BLAZE_CAST,
      condition: describe(buffPresent(SPELLS.VOLTAIC_BLAZE_BUFF), () => <></>, ''),
    },
    SPELLS.STORMSTRIKE_CAST,
    TALENTS.CRASH_LIGHTNING_TALENT,
    TALENTS.LAVA_LASH_TALENT,
    iceStrikeRule,
    {
      spell: TALENTS.FROST_SHOCK_TALENT,
      condition: buffPresent(SPELLS.HAILSTORM_BUFF),
    },
  ];

  return build(rules);
}

import Combatant from 'parser/core/Combatant';
import { Apl, build, Rule } from 'parser/shared/metrics/apl';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import SpellLink from 'interface/SpellLink';
import {
  and,
  buffPresent,
  describe,
  hasTalent,
  spellCharges,
} from 'parser/shared/metrics/apl/conditions';
import {
  getSpenderBlock,
  iceStrikeRule,
  MINIMUM_MAELSTROM_WEAPON_SPEND_STACKS,
  minimumMaelstromWeaponStacks,
} from './Conditions';

export function stormbringer(combatant: Combatant): Apl {
  const iceStrike = iceStrikeRule(combatant);

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
    /** Tempest */
    {
      spell: SPELLS.TEMPEST_CAST,
      condition: describe(
        and(
          buffPresent(SPELLS.TEMPEST_BUFF),
          minimumMaelstromWeaponStacks(MINIMUM_MAELSTROM_WEAPON_SPEND_STACKS),
        ),
        () => (
          <>
            available and at least {MINIMUM_MAELSTROM_WEAPON_SPEND_STACKS}{' '}
            <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks
          </>
        ),
      ),
    },

    /** Common MSW spender block */
    ...getSpenderBlock(combatant),
  ];

  rules.push(
    {
      spell: SPELLS.STORMSTRIKE_CAST,
      condition: spellCharges(SPELLS.STORMSTRIKE_CAST, { atLeast: 2, atMost: 2 }),
    },
    {
      spell: TALENTS.CRASH_LIGHTNING_TALENT,
      condition: describe(
        and(
          hasTalent(TALENTS.UNRELENTING_STORMS_TALENT),
          buffPresent(SPELLS.TWW_S2_ELECTROSTATIC_WAGER),
        ),
        () => (
          <>
            <SpellLink spell={SPELLS.TWW_S2_ELECTROSTATIC_WAGER} /> stacks.
          </>
        ),
      ),
    },
    {
      spell: SPELLS.VOLTAIC_BLAZE_CAST,
      condition: describe(buffPresent(SPELLS.VOLTAIC_BLAZE_BUFF), () => <></>, ''),
    },
    SPELLS.STORMSTRIKE_CAST,
    iceStrike,
    {
      spell: TALENTS.CRASH_LIGHTNING_TALENT,
      condition: describe(hasTalent(TALENTS.UNRELENTING_STORMS_TALENT), () => <></>, ''),
    },
    TALENTS.LAVA_LASH_TALENT,
    {
      spell: TALENTS.FROST_SHOCK_TALENT,
      condition: describe(
        buffPresent(SPELLS.HAILSTORM_BUFF),
        () => (
          <>
            consume <SpellLink spell={TALENTS.HAILSTORM_TALENT} />
          </>
        ),
        'to',
      ),
    },
    SPELLS.FLAME_SHOCK,
    TALENTS.FROST_SHOCK_TALENT,
  );

  return build(rules);
}

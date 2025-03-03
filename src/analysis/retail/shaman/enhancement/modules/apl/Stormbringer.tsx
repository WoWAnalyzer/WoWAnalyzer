import Combatant from 'parser/core/Combatant';
import { Apl, build, Rule } from 'parser/shared/metrics/apl';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import SpellLink from 'interface/SpellLink';
import {
  and,
  buffPresent,
  buffStacks,
  debuffMissing,
  describe,
  not,
  or,
  spellCharges,
} from 'parser/shared/metrics/apl/conditions';
import { getSpenderBlock, minimumMaelstromWeaponStacks } from './Conditions';

export function stormbringer(combatant: Combatant): Apl {
  const iceStrikeRule = combatant.hasTalent(TALENTS.ICE_STRIKE_1_ENHANCEMENT_TALENT)
    ? {
        spell: SPELLS.ICE_STRIKE_1_CAST,
        condition: buffPresent(SPELLS.ICE_STRIKE_1_USABLE_BUFF),
      }
    : TALENTS.ICE_STRIKE_2_ENHANCEMENT_TALENT;

  const rules: Rule[] = [
    /** Tempest with 8 MSW */
    {
      spell: SPELLS.TEMPEST_CAST,
      condition: describe(
        and(buffPresent(SPELLS.TEMPEST_BUFF), minimumMaelstromWeaponStacks(8)),
        () => (
          <>
            available and at least 8 <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks
          </>
        ),
      ),
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
    rules.push({
      spell: TALENTS.LAVA_LASH_TALENT,
      condition: or(
        buffPresent(SPELLS.HOT_HAND_BUFF),
        buffStacks(SPELLS.ASHEN_CATALYST_BUFF, { atLeast: 7 }),
      ),
    });
    combatant.hasTalent(TALENTS.STORMBLAST_TALENT) && rules.push(SPELLS.STORMSTRIKE);
    rules.push(
      {
        spell: SPELLS.VOLTAIC_BLAZE_CAST,
        condition: describe(buffPresent(SPELLS.VOLTAIC_BLAZE_BUFF), () => <></>, ''),
      },
      iceStrikeRule,
      {
        spell: TALENTS.FROST_SHOCK_TALENT,
        condition: buffPresent(SPELLS.HAILSTORM_BUFF),
      },
      TALENTS.LAVA_LASH_TALENT,
    );
    !combatant.hasTalent(TALENTS.STORMBLAST_TALENT) && rules.push(SPELLS.STORMSTRIKE);
    rules.push({
      spell: SPELLS.LIGHTNING_BOLT,
      condition: describe(
        and(minimumMaelstromWeaponStacks(5), not(buffPresent(SPELLS.TEMPEST_BUFF))),
        () => (
          <>
            you have at least 5 <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks
          </>
        ),
      ),
    });
  } else {
    rules.push({
      spell: SPELLS.STORMSTRIKE,
      condition: spellCharges(SPELLS.STORMSTRIKE, { atLeast: 2, atMost: 2 }),
    });
    if (combatant.hasTalent(TALENTS.FLOWING_SPIRITS_TALENT)) {
      rules.push(
        {
          spell: SPELLS.VOLTAIC_BLAZE_CAST,
          condition: describe(buffPresent(SPELLS.VOLTAIC_BLAZE_BUFF), () => <></>, ''),
        },
        SPELLS.STORMSTRIKE,
      );
    } else {
      rules.push(
        {
          spell: SPELLS.VOLTAIC_BLAZE_CAST,
          condition: describe(buffPresent(SPELLS.VOLTAIC_BLAZE_BUFF), () => <></>, ''),
        },
        iceStrikeRule,
        SPELLS.STORMSTRIKE,
        {
          spell: TALENTS.FROST_SHOCK_TALENT,
          condition: buffPresent(SPELLS.HAILSTORM_BUFF),
        },
      );
    }

    rules.push(
      {
        spell: SPELLS.LIGHTNING_BOLT,
        condition: describe(
          and(minimumMaelstromWeaponStacks(5), not(buffPresent(SPELLS.TEMPEST_BUFF))),
          () => (
            <>
              you have at least 5 <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks
            </>
          ),
        ),
      },
      {
        spell: SPELLS.FLAME_SHOCK,
        condition: debuffMissing(SPELLS.FLAME_SHOCK),
      },
      TALENTS.LAVA_LASH_TALENT,
      TALENTS.CRASH_LIGHTNING_TALENT,
    );
  }

  return build(rules);
}

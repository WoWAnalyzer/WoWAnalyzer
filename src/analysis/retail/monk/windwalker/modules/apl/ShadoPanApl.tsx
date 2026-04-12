import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/monk';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellLink from 'interface/SpellLink';
import Combatant from 'parser/core/Combatant';
import { Apl } from 'parser/shared/metrics/apl';
import {
  and,
  buffPresent,
  describe,
  hasResource,
  hasTalent,
  or,
  spellCooldownRemaining,
} from 'parser/shared/metrics/apl/conditions';
import {
  atTwoBlackoutKickStacks,
  aboutToCapEnergy,
  buildComboStrikesApl,
  danceOfChiJiExpiring,
  notAtTwoBlackoutKickStacks,
  notInZenithWithObsidianSpiral,
  optionalTouchOfDeath,
  whirlingDragonPunchReady,
} from './common';

export default function shadoPanApl(combatant: Combatant): Apl {
  return buildComboStrikesApl([
    {
      spell: SPELLS.TOUCH_OF_DEATH,
      condition: optionalTouchOfDeath,
    },
    {
      spell: TALENTS.WHIRLING_DRAGON_PUNCH_TALENT,
      condition: whirlingDragonPunchReady,
    },
    {
      spell: SPELLS.TIGER_PALM,
      condition: describe(
        and(
          hasResource(RESOURCE_TYPES.CHI, { atMost: 3 }),
          notAtTwoBlackoutKickStacks,
          aboutToCapEnergy(combatant),
          notInZenithWithObsidianSpiral,
        ),
        () => (
          <>
            you have less than 4 <SpellLink spell={RESOURCE_TYPES.CHI} />, fewer than 2 stacks of{' '}
            <SpellLink spell={SPELLS.COMBO_BREAKER_BUFF} />, and are about to cap energy
          </>
        ),
      ),
    },
    TALENTS.STRIKE_OF_THE_WINDLORD_TALENT,
    TALENTS.FISTS_OF_FURY_TALENT,
    {
      spell: SPELLS.RUSHING_WIND_KICK_CAST,
      condition: buffPresent(SPELLS.RUSHING_WIND_KICK_BUFF),
    },
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      condition: describe(
        and(danceOfChiJiExpiring, notAtTwoBlackoutKickStacks, notInZenithWithObsidianSpiral),
        () => (
          <>
            <SpellLink spell={SPELLS.DANCE_OF_CHI_JI_BUFF} /> has less than 4 seconds remaining, and
            you have fewer than 2 stacks of <SpellLink spell={SPELLS.COMBO_BREAKER_BUFF} />
          </>
        ),
      ),
    },
    TALENTS.RISING_SUN_KICK_TALENT,
    {
      spell: SPELLS.TIGER_PALM,
      condition: describe(
        or(
          and(
            spellCooldownRemaining(TALENTS.STRIKE_OF_THE_WINDLORD_TALENT, { atMost: 1 }),
            hasResource(RESOURCE_TYPES.CHI, { atMost: 1 }),
          ),
          and(
            spellCooldownRemaining(TALENTS.FISTS_OF_FURY_TALENT, { atMost: 1 }),
            hasResource(RESOURCE_TYPES.CHI, { atMost: 2 }),
          ),
          and(
            hasTalent(TALENTS.RUSHING_WIND_KICK_WINDWALKER_TALENT),
            buffPresent(SPELLS.RUSHING_WIND_KICK_BUFF),
            spellCooldownRemaining(SPELLS.RUSHING_WIND_KICK_CAST, { atMost: 1 }),
            hasResource(RESOURCE_TYPES.CHI, { atMost: 1 }),
          ),
          and(danceOfChiJiExpiring, hasResource(RESOURCE_TYPES.CHI, { atMost: 1 })),
          and(
            spellCooldownRemaining(TALENTS.RISING_SUN_KICK_TALENT, { atMost: 1 }),
            hasResource(RESOURCE_TYPES.CHI, { atMost: 1 }),
            notInZenithWithObsidianSpiral,
          ),
        ),
        () => <>a higher-priority chi spender is ready, and you do not have enough chi for it</>,
      ),
    },
    {
      spell: SPELLS.BLACKOUT_KICK,
      condition: describe(
        or(
          and(buffPresent(SPELLS.COMBO_BREAKER_BUFF), atTwoBlackoutKickStacks),
          buffPresent(TALENTS.ZENITH_TALENT),
        ),
        () => (
          <>
            you have <SpellLink spell={SPELLS.COMBO_BREAKER_BUFF} /> at 2 stacks or{' '}
            <SpellLink spell={TALENTS.ZENITH_TALENT} /> is active
          </>
        ),
      ),
    },
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      condition: describe(
        and(buffPresent(TALENTS.ZENITH_TALENT), hasResource(RESOURCE_TYPES.CHI, { atLeast: 4 })),
        () => (
          <>
            <SpellLink spell={TALENTS.ZENITH_TALENT} /> is active and you have more than 3{' '}
            <SpellLink spell={RESOURCE_TYPES.CHI} />
          </>
        ),
      ),
    },
    TALENTS.SLICING_WINDS_TALENT,
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      condition: buffPresent(SPELLS.DANCE_OF_CHI_JI_BUFF),
    },
    SPELLS.BLACKOUT_KICK,
    SPELLS.TIGER_PALM,
  ]);
}

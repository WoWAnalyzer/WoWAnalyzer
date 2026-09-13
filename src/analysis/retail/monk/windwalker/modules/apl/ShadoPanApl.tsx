import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/monk';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellLink from 'interface/SpellLink';
import Combatant from 'parser/core/Combatant';
import { Apl } from 'parser/shared/metrics/apl';
import {
  and,
  buffPresent,
  buffRemaining,
  describe,
  hasResource,
  hasTalent,
  inBloodlust,
  not,
  or,
  spellCooldownRemaining,
} from 'parser/shared/metrics/apl/conditions';
import {
  aboutToCapEnergy,
  buildComboStrikesApl,
  getZenithDurationMs,
  notAtTwoBlackoutKickStacks,
  notEnoughChiForFistsOfFury,
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
      spell: TALENTS.ZENITH_STOMP_TALENT,
      condition: describe(
        and(
          hasTalent(TALENTS.TIGEREYE_BREW_3_WINDWALKER_TALENT),
          or(
            hasResource(RESOURCE_TYPES.CHI, { atMost: 2 }),
            and(
              buffPresent(TALENTS.ZENITH_TALENT),
              buffRemaining(TALENTS.ZENITH_TALENT, getZenithDurationMs(combatant), {
                atMost: 3000,
              }),
            ),
          ),
        ),
        () => (
          <>
            you are low on <SpellLink spell={RESOURCE_TYPES.CHI} /> or{' '}
            <SpellLink spell={TALENTS.ZENITH_TALENT} /> is almost over
          </>
        ),
      ),
    },
    {
      spell: SPELLS.TIGER_PALM,
      condition: describe(
        or(
          and(
            hasResource(RESOURCE_TYPES.CHI, { atMost: 3 }),
            aboutToCapEnergy(combatant),
            not(buffPresent(TALENTS.ZENITH_TALENT)),
            not(inBloodlust()),
            notAtTwoBlackoutKickStacks,
          ),
          and(
            spellCooldownRemaining(TALENTS.FISTS_OF_FURY_TALENT, { atMost: 1 }),
            notEnoughChiForFistsOfFury(combatant),
          ),
        ),
        () => (
          <>
            you are about to cap energy outside <SpellLink spell={TALENTS.ZENITH_TALENT} /> or do
            not have enough <SpellLink spell={RESOURCE_TYPES.CHI} /> for{' '}
            <SpellLink spell={TALENTS.FISTS_OF_FURY_TALENT} />
          </>
        ),
      ),
    },
    TALENTS.FISTS_OF_FURY_TALENT,
    {
      spell: SPELLS.RUSHING_WIND_KICK_CAST,
      condition: buffPresent(SPELLS.RUSHING_WIND_KICK_BUFF),
    },
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      condition: describe(
        and(buffPresent(SPELLS.DANCE_OF_CHI_JI_BUFF), buffPresent(SPELLS.UNBROKEN_RHYTHM_BUFF)),
        () => (
          <>
            you have <SpellLink spell={SPELLS.DANCE_OF_CHI_JI_BUFF} /> and{' '}
            <SpellLink spell={SPELLS.UNBROKEN_RHYTHM_BUFF} />
          </>
        ),
      ),
    },
    TALENTS.RISING_SUN_KICK_TALENT,
    {
      spell: SPELLS.BLACKOUT_KICK,
      condition: describe(
        or(
          buffPresent(SPELLS.COMBO_BREAKER_BUFF),
          and(buffPresent(TALENTS.ZENITH_TALENT), hasTalent(TALENTS.OBSIDIAN_SPIRAL_TALENT)),
        ),
        () => (
          <>
            you have <SpellLink spell={SPELLS.COMBO_BREAKER_BUFF} /> or{' '}
            <SpellLink spell={TALENTS.ZENITH_TALENT} /> is active with{' '}
            <SpellLink spell={TALENTS.OBSIDIAN_SPIRAL_TALENT} />
          </>
        ),
      ),
    },
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      condition: describe(
        and(
          buffPresent(TALENTS.ZENITH_TALENT),
          or(
            hasResource(RESOURCE_TYPES.CHI, { atLeast: 5 }),
            buffPresent(SPELLS.DANCE_OF_CHI_JI_BUFF),
          ),
        ),
        () => (
          <>
            <SpellLink spell={TALENTS.ZENITH_TALENT} /> is active and you either have more than 4{' '}
            <SpellLink spell={RESOURCE_TYPES.CHI} /> or{' '}
            <SpellLink spell={SPELLS.DANCE_OF_CHI_JI_BUFF} />
          </>
        ),
      ),
    },
    {
      spell: SPELLS.TIGER_PALM,
      condition: hasResource(RESOURCE_TYPES.CHI, { atMost: 1 }),
    },
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      condition: describe(buffPresent(SPELLS.DANCE_OF_CHI_JI_BUFF), () => (
        <>
          you have <SpellLink spell={SPELLS.DANCE_OF_CHI_JI_BUFF} />
        </>
      )),
    },
    {
      spell: SPELLS.TIGER_PALM,
      condition: hasResource(RESOURCE_TYPES.CHI, { atMost: 4 }),
    },
    SPELLS.BLACKOUT_KICK,
  ]);
}

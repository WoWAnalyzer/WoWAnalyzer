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
  buffStacks,
  describe,
  hasResource,
  hasTalent,
  inBloodlust,
  not,
  or,
  spellCooldownRemaining,
} from 'parser/shared/metrics/apl/conditions';
import {
  atTwoBlackoutKickStacks,
  aboutToCapEnergy,
  buildComboStrikesApl,
  getZenithDurationMs,
  notEnoughChiForFistsOfFury,
  optionalTouchOfDeath,
  whirlingDragonPunchReady,
} from './common';

const ZENITH_ENDING_MS = 3000;
const zenithPresent = buffPresent(TALENTS.ZENITH_TALENT);
const danceOfChiJiPresent = buffPresent(SPELLS.DANCE_OF_CHI_JI_BUFF);

const whirlingDragonPunchGracePeriod = and(
  whirlingDragonPunchReady,
  or(
    spellCooldownRemaining(TALENTS.RISING_SUN_KICK_TALENT, { atMost: 1 }),
    spellCooldownRemaining(TALENTS.FISTS_OF_FURY_TALENT, { atMost: 1 }),
  ),
);

export default function shadoPanApl(combatant: Combatant): Apl {
  return buildComboStrikesApl([
    {
      spell: TALENTS.WHIRLING_DRAGON_PUNCH_TALENT,
      condition: describe(whirlingDragonPunchGracePeriod, () => <>during its grace period</>),
    },
    {
      spell: SPELLS.ZENITH_STOMP_CAST,
      condition: describe(
        and(
          hasTalent(TALENTS.TIGEREYE_BREW_3_WINDWALKER_TALENT),
          buffPresent(SPELLS.ZENITH_STOMP_CASTS_AVAILABLE),
          or(
            hasResource(RESOURCE_TYPES.CHI, { atMost: 2 }),
            and(
              zenithPresent,
              buffRemaining(TALENTS.ZENITH_TALENT, getZenithDurationMs(combatant), {
                atMost: ZENITH_ENDING_MS,
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
        and(
          hasResource(RESOURCE_TYPES.CHI, { atMost: 3 }),
          aboutToCapEnergy(combatant),
          not(zenithPresent),
          not(inBloodlust()),
        ),
        () => (
          <>
            you are about to cap energy outside of <SpellLink spell={TALENTS.ZENITH_TALENT} /> and
            Bloodlust without overcapping <SpellLink spell={RESOURCE_TYPES.CHI} />
          </>
        ),
      ),
    },
    TALENTS.FISTS_OF_FURY_TALENT,
    {
      spell: TALENTS.WHIRLING_DRAGON_PUNCH_TALENT,
      condition: whirlingDragonPunchReady,
    },
    TALENTS.STRIKE_OF_THE_WINDLORD_TALENT,
    {
      spell: SPELLS.TIGER_PALM,
      condition: describe(
        and(
          spellCooldownRemaining(TALENTS.FISTS_OF_FURY_TALENT, { atMost: 1 }),
          notEnoughChiForFistsOfFury(combatant),
        ),
        () => (
          <>
            <SpellLink spell={TALENTS.FISTS_OF_FURY_TALENT} /> is ready and you do not have enough{' '}
            <SpellLink spell={RESOURCE_TYPES.CHI} /> to cast it
          </>
        ),
      ),
    },
    {
      spell: SPELLS.RUSHING_WIND_KICK_CAST,
      condition: buffPresent(SPELLS.RUSHING_WIND_KICK_BUFF),
    },
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      condition: describe(
        and(danceOfChiJiPresent, buffStacks(SPELLS.UNBROKEN_RHYTHM_BUFF, { atLeast: 1 })),
        () => (
          <>
            <SpellLink spell={SPELLS.DANCE_OF_CHI_JI_BUFF} /> and{' '}
            <SpellLink spell={SPELLS.UNBROKEN_RHYTHM_BUFF} /> are active
          </>
        ),
      ),
    },
    TALENTS.RISING_SUN_KICK_TALENT,
    { spell: SPELLS.BLACKOUT_KICK, condition: atTwoBlackoutKickStacks },
    {
      spell: SPELLS.BLACKOUT_KICK,
      condition: describe(
        and(
          zenithPresent,
          or(buffPresent(SPELLS.COMBO_BREAKER_BUFF), hasTalent(TALENTS.OBSIDIAN_SPIRAL_TALENT)),
        ),
        () => (
          <>
            <SpellLink spell={TALENTS.ZENITH_TALENT} /> is active and either{' '}
            <SpellLink spell={SPELLS.COMBO_BREAKER_BUFF} /> is active or you are talented into{' '}
            <SpellLink spell={TALENTS.OBSIDIAN_SPIRAL_TALENT} />
          </>
        ),
      ),
    },
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      condition: describe(
        and(
          zenithPresent,
          or(hasResource(RESOURCE_TYPES.CHI, { atLeast: 5 }), danceOfChiJiPresent),
        ),
        () => (
          <>
            <SpellLink spell={TALENTS.ZENITH_TALENT} /> is active and you have more than 4{' '}
            <SpellLink spell={RESOURCE_TYPES.CHI} /> or{' '}
            <SpellLink spell={SPELLS.DANCE_OF_CHI_JI_BUFF} />
          </>
        ),
      ),
    },
    { spell: SPELLS.TOUCH_OF_DEATH, condition: optionalTouchOfDeath },
    {
      spell: SPELLS.TIGER_PALM,
      condition: hasResource(RESOURCE_TYPES.CHI, { atMost: 1 }),
    },
    {
      spell: SPELLS.BLACKOUT_KICK,
      condition: buffPresent(SPELLS.COMBO_BREAKER_BUFF),
    },
    { spell: SPELLS.SPINNING_CRANE_KICK, condition: danceOfChiJiPresent },
    TALENTS.SLICING_WINDS_TALENT,
    {
      spell: SPELLS.TIGER_PALM,
      condition: hasResource(RESOURCE_TYPES.CHI, { atMost: 4 }),
    },
    SPELLS.BLACKOUT_KICK,
  ]);
}

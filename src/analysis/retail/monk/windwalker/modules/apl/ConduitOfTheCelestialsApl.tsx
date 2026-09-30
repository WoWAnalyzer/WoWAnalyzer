import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/monk';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellLink from 'interface/SpellLink';
import Combatant from 'parser/core/Combatant';
import { Apl } from 'parser/shared/metrics/apl';
import {
  and,
  buffMissing,
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
  notEnoughChiForFistsOfFury,
  optionalTouchOfDeath,
  whirlingDragonPunchReady,
} from './common';

const HEART_OF_THE_JADE_SERPENT_DURATION_MS = 10000;

const HEART_OF_THE_JADE_SERPENT_BUFFS = [
  SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF,
  SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY,
];

const activeHotJSMissing = () =>
  and(...HEART_OF_THE_JADE_SERPENT_BUFFS.map((spell) => buffMissing(spell)));

const activeHotJSRemaining = (range: { atLeast?: number; atMost?: number }) =>
  or(
    ...HEART_OF_THE_JADE_SERPENT_BUFFS.map((spell) =>
      buffRemaining(spell, HEART_OF_THE_JADE_SERPENT_DURATION_MS, range),
    ),
  );

const celestialConduitCastable = buffPresent(SPELLS.CELESTIAL_CONDUIT_CASTABLE_WW);

const xuenNotReadySoon = or(
  not(hasTalent(TALENTS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT)),
  spellCooldownRemaining(TALENTS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT, { atLeast: 10000 }),
);

export default function conduitOfTheCelestialsApl(combatant: Combatant): Apl {
  return buildComboStrikesApl([
    {
      spell: SPELLS.TOUCH_OF_DEATH,
      condition: optionalTouchOfDeath,
    },
    {
      spell: TALENTS.WHIRLING_DRAGON_PUNCH_TALENT,
      condition: describe(and(whirlingDragonPunchReady, xuenNotReadySoon), () => (
        <>
          <SpellLink spell={TALENTS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT} /> will not be available
          within 10 seconds
        </>
      )),
    },
    {
      spell: TALENTS.CELESTIAL_CONDUIT_WINDWALKER_TALENT,
      condition: describe(and(activeHotJSMissing(), celestialConduitCastable), () => (
        <>
          no <SpellLink spell={SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF} /> is active
        </>
      )),
    },
    {
      spell: TALENTS.ZENITH_STOMP_TALENT,
      condition: describe(
        or(
          hasResource(RESOURCE_TYPES.CHI, { atMost: 2 }),
          and(
            buffPresent(TALENTS.ZENITH_TALENT),
            buffRemaining(TALENTS.ZENITH_TALENT, getZenithDurationMs(combatant), { atMost: 3000 }),
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
      spell: TALENTS.FISTS_OF_FURY_TALENT,
      condition: describe(activeHotJSRemaining({ atMost: 1000 }), () => (
        <>
          <SpellLink spell={SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF} /> has less than 1 second
          remaining
        </>
      )),
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
      condition: describe(buffPresent(SPELLS.UNBROKEN_RHYTHM_BUFF), () => (
        <>
          you have <SpellLink spell={SPELLS.UNBROKEN_RHYTHM_BUFF} />
        </>
      )),
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

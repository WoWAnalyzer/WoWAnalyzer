import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/monk';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellLink from 'interface/SpellLink';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import {
  and,
  buffMissing,
  buffPresent,
  buffRemaining,
  buffStacks,
  describe,
  hasResource,
  hasTalent,
  lastSpellCast,
  not,
  or,
  spellCooldownRemaining,
} from 'parser/shared/metrics/apl/conditions';
import {
  ASCENSION_ENERGY_MAX_ADDITION,
  BASE_ENERGY_MAX,
  INNER_PEACE_ENERGY_MAX_ADDITION,
} from '../resources/EnergyCapTracker';
import Combatant from 'parser/core/Combatant';

const hasChi = (min: number) =>
  describe(
    or(
      and(
        hasTalent(TALENTS.ORDERED_ELEMENTS_TALENT),
        buffPresent(TALENTS.STORM_EARTH_AND_FIRE_TALENT),
        hasResource(RESOURCE_TYPES.CHI, { atLeast: min - 1 }),
      ),
      hasResource(RESOURCE_TYPES.CHI, { atLeast: min }),
    ),
    (tense) => 'available',
  );

const shado_pan_apl = (combatant: Combatant) =>
  build([
    {
      spell: TALENTS.RISING_SUN_KICK_TALENT,
      condition: and(hasChi(2), buffPresent(TALENTS.XUENS_BATTLEGEAR_TALENT)),
    },
    {
      spell: SPELLS.TIGER_PALM,
      condition: describe(
        and(
          hasResource(RESOURCE_TYPES.CHI, {
            atMost: combatant.hasTalent(TALENTS.ASCENSION_TALENT) ? 4 : 3,
          }),
          hasResource(RESOURCE_TYPES.ENERGY, {
            // over 85% of max energy
            atLeast:
              (BASE_ENERGY_MAX +
                (combatant.hasTalent(TALENTS.ASCENSION_TALENT)
                  ? ASCENSION_ENERGY_MAX_ADDITION
                  : 0) +
                (combatant.hasTalent(TALENTS.INNER_PEACE_TALENT)
                  ? INNER_PEACE_ENERGY_MAX_ADDITION
                  : 0)) *
              0.85,
          }),
          not(lastSpellCast(SPELLS.TIGER_PALM)),
        ),
        (tense) => (
          <>
            you have at most {combatant.hasTalent(TALENTS.ASCENSION_TALENT) ? 4 : 3}{' '}
            <SpellLink spell={RESOURCE_TYPES.CHI} />, AND about to cap energy
          </>
        ),
      ),
    },
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      condition: buffStacks(SPELLS.DANCE_OF_CHI_JI_BUFF, { atLeast: 2 }),
    },
    {
      spell: TALENTS.STRIKE_OF_THE_WINDLORD_TALENT,
      condition: hasChi(2),
    },
    {
      spell: TALENTS.WHIRLING_DRAGON_PUNCH_TALENT,
      condition: describe(buffPresent(SPELLS.WHIRLING_DRAGON_PUNCH_USABLE), (tense) => (
        <>
          <SpellLink spell={TALENTS.RISING_SUN_KICK_TALENT} /> and{' '}
          <SpellLink spell={TALENTS.FISTS_OF_FURY_TALENT} /> {tenseAlt(tense, 'are', 'were')} on
          cooldown.
        </>
      )),
    },
    {
      spell: SPELLS.CRACKLING_JADE_LIGHTNING,
      condition: buffStacks(TALENTS.LAST_EMPERORS_CAPACITOR_TALENT, { atLeast: 20 }),
    },
    TALENTS.SLICING_WINDS_TALENT,
    {
      spell: TALENTS.FISTS_OF_FURY_TALENT,
      condition: hasChi(3),
    },
    {
      spell: TALENTS.RISING_SUN_KICK_TALENT,
      condition: hasChi(2),
    },
    {
      spell: SPELLS.BLACKOUT_KICK,
      condition: and(
        hasChi(1),
        buffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY, {
          atLeast: combatant.hasTalent(TALENTS.KNOWLEDGE_OF_THE_BROKEN_TEMPLE_TALENT) ? 8 : 4,
        }),
      ),
    },
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      condition: buffPresent(SPELLS.DANCE_OF_CHI_JI_BUFF),
    },
    {
      spell: TALENTS.CHI_BURST_WINDWALKER_TALENT,
      condition: buffPresent(SPELLS.CHI_BURST_PROC),
    },
    {
      spell: SPELLS.CRACKLING_JADE_LIGHTNING,
      condition: and(
        hasTalent(TALENTS.LAST_EMPERORS_CAPACITOR_TALENT),
        buffStacks(SPELLS.LAST_EMPERORS_CAPACITOR_BUFF, { atLeast: 20 }),
      ),
    },
    {
      spell: SPELLS.TIGER_PALM,
      condition: describe(
        and(
          hasResource(RESOURCE_TYPES.ENERGY, {
            atLeast: combatant.hasTalent(TALENTS.CELERITY_TALENT) ? 55 : 60,
          }),
          not(lastSpellCast(SPELLS.TIGER_PALM)),
          not(lastSpellCast(SPELLS.MELEE)),
        ),
        (tense) => <>you have excess energy and would not break mastery</>,
      ),
    },
    {
      spell: SPELLS.BLACKOUT_KICK,
      condition: describe(
        and(hasChi(1), not(lastSpellCast(SPELLS.BLACKOUT_KICK)), not(lastSpellCast(SPELLS.MELEE))),
        (tense) => <>you would not break mastery</>,
      ),
    },
  ]);

export const conduit_apl = (combatant: Combatant) =>
  build([
    {
      spell: TALENTS.STRIKE_OF_THE_WINDLORD_TALENT,
      condition: and(
        hasChi(2),
        buffMissing(SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY),
        spellCooldownRemaining(TALENTS.FISTS_OF_FURY_TALENT, { atMost: 6000 }),
      ),
    },
    {
      spell: TALENTS.CELESTIAL_CONDUIT_TALENT,
      condition: describe(
        and(
          buffRemaining(SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF, 10, { atMost: 1000 }, true),
          spellCooldownRemaining(TALENTS.FISTS_OF_FURY_TALENT, { atMost: 6000 }),
        ),
        (tense) => (
          <>
            <SpellLink spell={SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF} /> is missing
          </>
        ),
      ),
    },
    {
      spell: TALENTS.RISING_SUN_KICK_TALENT,
      condition: and(hasChi(2), buffPresent(TALENTS.XUENS_BATTLEGEAR_TALENT)),
    },
    {
      spell: SPELLS.TIGER_PALM,
      condition: describe(
        and(
          hasResource(RESOURCE_TYPES.CHI, {
            atMost: combatant.hasTalent(TALENTS.ASCENSION_TALENT) ? 4 : 3,
          }),
          hasResource(RESOURCE_TYPES.ENERGY, {
            // over 85% of max energy
            atLeast:
              (BASE_ENERGY_MAX +
                (combatant.hasTalent(TALENTS.ASCENSION_TALENT)
                  ? ASCENSION_ENERGY_MAX_ADDITION
                  : 0) +
                (combatant.hasTalent(TALENTS.INNER_PEACE_TALENT)
                  ? INNER_PEACE_ENERGY_MAX_ADDITION
                  : 0)) *
              0.85,
          }),
          not(lastSpellCast(SPELLS.TIGER_PALM)),
        ),
        (tense) => (
          <>
            you have at most {combatant.hasTalent(TALENTS.ASCENSION_TALENT) ? 4 : 3}{' '}
            <SpellLink spell={RESOURCE_TYPES.CHI} />, AND about to cap energy
          </>
        ),
      ),
    },
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      condition: buffStacks(SPELLS.DANCE_OF_CHI_JI_BUFF, { atLeast: 2 }),
    },
    {
      spell: TALENTS.WHIRLING_DRAGON_PUNCH_TALENT,
      condition: describe(buffPresent(SPELLS.WHIRLING_DRAGON_PUNCH_USABLE), (tense) => (
        <>
          <SpellLink spell={TALENTS.RISING_SUN_KICK_TALENT} /> and{' '}
          <SpellLink spell={TALENTS.FISTS_OF_FURY_TALENT} /> {tenseAlt(tense, 'are', 'were')} on
          cooldown.
        </>
      )),
    },
    {
      spell: SPELLS.CRACKLING_JADE_LIGHTNING,
      condition: buffStacks(TALENTS.LAST_EMPERORS_CAPACITOR_TALENT, { atLeast: 20 }),
    },
    TALENTS.SLICING_WINDS_TALENT,
    {
      spell: TALENTS.FISTS_OF_FURY_TALENT,
      condition: hasChi(3),
    },
    {
      spell: TALENTS.RISING_SUN_KICK_TALENT,
      condition: hasChi(2),
    },
    {
      spell: SPELLS.BLACKOUT_KICK,
      condition: describe(
        and(
          hasChi(1),
          or(
            and(
              hasTalent(TALENTS.KNOWLEDGE_OF_THE_BROKEN_TEMPLE_TALENT),
              buffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY, { atLeast: 8 }),
            ),
            and(
              not(hasTalent(TALENTS.KNOWLEDGE_OF_THE_BROKEN_TEMPLE_TALENT)),
              buffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY, { atLeast: 4 }),
            ),
          ),
        ),
        (tense) => (
          <>
            at max stacks of <SpellLink spell={TALENTS.TEACHINGS_OF_THE_MONASTERY_TALENT} />
          </>
        ),
      ),
    },
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      condition: buffPresent(SPELLS.DANCE_OF_CHI_JI_BUFF),
    },
    {
      spell: TALENTS.CHI_BURST_WINDWALKER_TALENT,
      condition: buffPresent(SPELLS.CHI_BURST_PROC),
    },
    {
      spell: SPELLS.CRACKLING_JADE_LIGHTNING,
      condition: describe(
        and(
          hasTalent(TALENTS.LAST_EMPERORS_CAPACITOR_TALENT),
          buffStacks(SPELLS.LAST_EMPERORS_CAPACITOR_BUFF, { atLeast: 15 }),
        ),
        (tense) => (
          <>
            <SpellLink spell={TALENTS.LAST_EMPERORS_CAPACITOR_TALENT} /> would overcap before next
            good use
          </>
        ),
      ),
    },
    {
      spell: SPELLS.TIGER_PALM,
      condition: describe(
        and(
          hasResource(RESOURCE_TYPES.ENERGY, {
            atLeast: combatant.hasTalent(TALENTS.CELERITY_TALENT) ? 55 : 60,
          }),
          not(lastSpellCast(SPELLS.TIGER_PALM)),
          not(lastSpellCast(SPELLS.MELEE)),
        ),
        (tense) => <>you have excess energy and would not break mastery</>,
      ),
    },
    {
      spell: SPELLS.BLACKOUT_KICK,
      condition: describe(
        and(hasChi(1), not(lastSpellCast(SPELLS.BLACKOUT_KICK)), not(lastSpellCast(SPELLS.MELEE))),
        (tense) => <>you would not break mastery</>,
      ),
    },
  ]);

export const apl = (info: PlayerInfo): Apl => {
  if (info.combatant.hasTalent(TALENTS.CELESTIAL_CONDUIT_TALENT)) {
    return conduit_apl(info.combatant);
  } else {
    return shado_pan_apl(info.combatant);
  }
};

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl(info));
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});

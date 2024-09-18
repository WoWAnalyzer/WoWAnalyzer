import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/monk';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellLink from 'interface/SpellLink';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { build, CheckResult, PlayerInfo, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import { AplRuleProps } from 'parser/shared/metrics/apl/ChecklistRule';
import {
  and,
  buffPresent,
  buffStacks,
  describe,
  hasResource,
  hasTalent,
  lastSpellCast,
  not,
} from 'parser/shared/metrics/apl/conditions';
import {
  ASCENSION_ENERGY_MAX_ADDITION,
  BASE_ENERGY_MAX,
  INNER_PEACE_ENERGY_MAX_ADDITION,
} from '../resources/EnergyCapTracker';

const hasChi = (min: number) => hasResource(RESOURCE_TYPES.CHI, { atLeast: min });

export const apl = build([
  {
    spell: SPELLS.TIGER_PALM,
    condition: describe(
      and(
        hasResource(RESOURCE_TYPES.CHI, { atMost: hasTalent(TALENTS.ASCENSION_TALENT) ? 4 : 3 }),
        hasResource(RESOURCE_TYPES.ENERGY, {
          // over 85% of max energy
          atLeast:
            (BASE_ENERGY_MAX +
              (hasTalent(TALENTS.ASCENSION_TALENT) ? ASCENSION_ENERGY_MAX_ADDITION : 0) +
              (hasTalent(TALENTS.INNER_PEACE_TALENT) ? INNER_PEACE_ENERGY_MAX_ADDITION : 0)) *
            0.85,
        }),
        not(lastSpellCast(SPELLS.TIGER_PALM)),
      ),
      (tense) => (
        <>
          you have at most {hasTalent(TALENTS.ASCENSION_TALENT) ? 4 : 3}{' '}
          <SpellLink spell={RESOURCE_TYPES.CHI} />, AND about to cap energy
        </>
      ),
    ),
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
  TALENTS.CELESTIAL_CONDUIT_TALENT,
  {
    spell: TALENTS.RISING_SUN_KICK_TALENT,
    condition: hasChi(2),
  },
  {
    spell: TALENTS.FISTS_OF_FURY_TALENT,
    condition: hasChi(3),
  },
  {
    spell: SPELLS.BLACKOUT_KICK,
    condition: and(
      hasChi(1),
      buffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY, {
        atLeast: hasTalent(TALENTS.KNOWLEDGE_OF_THE_BROKEN_TEMPLE_TALENT) ? 8 : 4,
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
          atLeast: hasTalent(TALENTS.CELERITY_TALENT) ? 55 : 60,
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

export const aplProps = (events: AnyEvent[], info: PlayerInfo): AplRuleProps => {
  const check = aplCheck(apl);
  return {
    apl: apl,
    checkResults: check(events, info),
  };
};

export const checkApl = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl);
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = checkApl(events, info);
  annotateTimeline(violations);

  return undefined;
});

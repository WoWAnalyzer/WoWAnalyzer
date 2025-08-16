import aplCheck, { Condition, PlayerInfo, Rule, build, tenseAlt } from 'parser/shared/metrics/apl';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import spells from '../../spell-list_Monk_Brewmaster.classic';
import SPELLS from 'common/SPELLS/classic';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceLink from 'interface/ResourceLink';
import Spell from 'common/SPELLS/Spell';
import { suggestion } from 'parser/core/Analyzer';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import { hasClassicTalent } from 'parser/shared/metrics/apl/conditions/hasTalent';
import { AnyEvent } from 'parser/core/Events';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import { RJW_DAMAGE } from 'analysis/classic/monk/shared/RushingJadeWindLinkNormalizer';
import SpellLink from 'interface/SpellLink';

const MAX_CHI = 5;
const MAX_CHI_ASCENSION = 6;

function generateChi(spell: Spell, chiGenerated: number, optional = false): Rule[] {
  const wrapper = optional ? cnd.optionalRule : (inner: Condition<unknown>) => inner;
  return [
    {
      spell,
      condition: wrapper(
        cnd.describe(
          cnd.and(
            cnd.hasResource(
              RESOURCE_TYPES.CHI,
              { atMost: MAX_CHI_ASCENSION - chiGenerated - 1 },
              2,
            ),
            hasClassicTalent(spells.ASCENSION_TALENT),
          ),
          (tense) => (
            <>
              you {tenseAlt(tense, "won't", "wouldn't")} overcap on{' '}
              <ResourceLink id={RESOURCE_TYPES.CHI.id} />
            </>
          ),
        ),
      ),
    },
    {
      spell,
      condition: wrapper(
        cnd.describe(
          cnd.and(
            cnd.hasResource(RESOURCE_TYPES.CHI, { atMost: MAX_CHI - chiGenerated - 1 }, 2),
            cnd.not(hasClassicTalent(spells.ASCENSION_TALENT)),
          ),
          (tense) => (
            <>
              you {tenseAlt(tense, "won't", "wouldn't")} overcap on{' '}
              <ResourceLink id={RESOURCE_TYPES.CHI.id} />
            </>
          ),
        ),
      ),
    },
  ];
}

export const parselordApl = build([
  {
    spell: spells.BLACKOUT_KICK,
    condition: cnd.and(
      cnd.buffMissing(SPELLS.SHUFFLE),
      cnd.hasResource(RESOURCE_TYPES.CHI, { atLeast: 2 }, 2),
    ),
  },
  {
    spell: spells.EXPEL_HARM,
    condition: cnd.buffPresent(spells.DESPERATE_MEASURES_PASSIVE),
  },
  ...generateChi(spells.KEG_SMASH, 2),
  ...generateChi(spells.EXPEL_HARM, 1, true),
  {
    spell: spells.BLACKOUT_KICK,
    condition: cnd.optionalRule(
      cnd.hasResource(RESOURCE_TYPES.CHI, { atLeast: 2 }, 2),
      'It is fine to cast other cooldown abilities before spending Chi',
    ),
  },
  spells.CHI_WAVE_TALENT,
  spells.CHI_BURST_TALENT,
  spells.RUSHING_JADE_WIND_TALENT,
  ...generateChi(SPELLS.JAB_2H, 1, true),
  ...generateChi(SPELLS.JAB_1H, 1, true),
  {
    spell: spells.BREATH_OF_FIRE,
    condition: cnd.optionalRule(
      cnd.targetsHit({ atLeast: 3 }),
      <>
        <SpellLink spell={spells.BREATH_OF_FIRE} /> is a low priority because of its high{' '}
        <ResourceLink id={RESOURCE_TYPES.CHI.id} /> cost and low utility.
      </>,
    ),
  },
  spells.TIGER_PALM,
  {
    spell: spells.BLACKOUT_KICK,
    condition: cnd.hasResource(RESOURCE_TYPES.CHI, { atLeast: 2 }, 2),
  },
]);

export const apl = build([
  {
    spell: spells.BLACKOUT_KICK,
    condition: cnd.and(
      cnd.buffMissing(SPELLS.SHUFFLE),
      cnd.hasResource(RESOURCE_TYPES.CHI, { atLeast: 2 }, 2),
    ),
  },
  {
    spell: spells.EXPEL_HARM,
    condition: cnd.buffPresent(spells.DESPERATE_MEASURES_PASSIVE),
  },
  ...generateChi(spells.KEG_SMASH, 2),
  ...generateChi(spells.EXPEL_HARM, 1),
  {
    spell: spells.BLACKOUT_KICK,
    condition: cnd.optionalRule(
      cnd.hasResource(RESOURCE_TYPES.CHI, { atLeast: 2 }, 2),
      'It is fine to cast other cooldown abilities before spending Chi',
    ),
  },
  spells.CHI_WAVE_TALENT,
  spells.CHI_BURST_TALENT,
  {
    spell: spells.RUSHING_JADE_WIND_TALENT,
    condition: cnd.optionalRule(
      cnd.targetsHit(
        { atLeast: 3 },
        {
          targetLinkRelation: RJW_DAMAGE,
        },
      ),
    ),
  },
  ...generateChi(SPELLS.JAB_2H, 1),
  ...generateChi(SPELLS.JAB_1H, 1),
  spells.TIGER_PALM,
  {
    spell: spells.BREATH_OF_FIRE,
    condition: cnd.optionalRule(
      cnd.targetsHit({ atLeast: 3 }),
      <>
        <SpellLink spell={spells.BREATH_OF_FIRE} /> is a low priority because of its high{' '}
        <ResourceLink id={RESOURCE_TYPES.CHI.id} /> cost and low utility.
      </>,
    ),
  },
  {
    spell: spells.BLACKOUT_KICK,
    condition: cnd.hasResource(RESOURCE_TYPES.CHI, { atLeast: 2 }, 2),
  },
]);

export const parselordCheck = aplCheck(parselordApl);
export const check = aplCheck(apl);

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);
  return undefined;
});

// the parsing rotation is characterized by:
// 1. high Tiger Palm casts (> Jab casts, at least 8 cpm)
// 2. low casts of Expel Harm (<1 cpm)
// basically prioritizing the raw damage of TP over the Chi generation of Jab/EH.
export function isUsingParseRotation(
  events: AnyEvent[],
  info: PlayerInfo,
  castEff: CastEfficiency,
): boolean {
  const tpCasts = castEff.getCastEfficiencyForSpell(spells.TIGER_PALM, true);
  const jab1hCasts = castEff.getCastEfficiencyForSpell(SPELLS.JAB_1H, true);
  const jab2hCasts = castEff.getCastEfficiencyForSpell(SPELLS.JAB_2H, true);
  const ehCasts = castEff.getCastEfficiencyForSpell(spells.EXPEL_HARM);

  if (!tpCasts) {
    return false;
  }

  const jabCondition =
    tpCasts.cpm >= 8 && tpCasts.cpm >= (jab1hCasts?.cpm ?? 0) + (jab2hCasts?.cpm ?? 0);
  const ehCondition = (ehCasts?.cpm ?? 0) <= 1;

  const result = parselordCheck(events, info);
  const accuracy = result.successes.length / (result.successes.length + result.violations.length);

  return accuracy >= 0.7 && jabCondition && ehCondition;
}

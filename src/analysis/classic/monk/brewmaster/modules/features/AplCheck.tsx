import aplCheck, { Condition, Rule, build, tenseAlt } from 'parser/shared/metrics/apl';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import spells from '../../spell-list_Monk_Brewmaster.classic';
import SPELLS from 'common/SPELLS/classic';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceLink from 'interface/ResourceLink';
import Spell from 'common/SPELLS/Spell';
import { suggestion } from 'parser/core/Analyzer';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import { hasClassicTalent } from 'parser/shared/metrics/apl/conditions/hasTalent';

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
            cnd.hasResource(RESOURCE_TYPES.CHI, { atMost: MAX_CHI_ASCENSION - chiGenerated - 1 }),
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
            cnd.hasResource(RESOURCE_TYPES.CHI, { atMost: MAX_CHI - chiGenerated - 1 }),
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

export const apl = build([
  {
    spell: spells.BLACKOUT_KICK,
    condition: cnd.and(
      cnd.buffMissing(SPELLS.SHUFFLE),
      cnd.hasResource(RESOURCE_TYPES.CHI, { atLeast: 2 }),
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
      cnd.hasResource(RESOURCE_TYPES.CHI, { atLeast: 2 }),
      'It is fine to cast other cooldown abilities before spending Chi',
    ),
  },
  spells.CHI_WAVE_TALENT,
  spells.CHI_BURST_TALENT,
  spells.RUSHING_JADE_WIND_TALENT,
  ...generateChi(SPELLS.JAB_2H, 1, true),
  ...generateChi(SPELLS.JAB_1H, 1, true),
  spells.TIGER_PALM,
  {
    spell: spells.BLACKOUT_KICK,
    condition: cnd.hasResource(RESOURCE_TYPES.CHI, { atLeast: 2 }),
  },
]);

export const check = aplCheck(apl);

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);
  return undefined;
});

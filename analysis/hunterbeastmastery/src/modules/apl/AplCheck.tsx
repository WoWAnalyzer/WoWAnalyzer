import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { WIPSuggestionFactory } from 'parser/core/CombatLogParser';
import aplCheck, { build } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import {
  buffPresent,
  buffMissing,
  hasConduit,
  or,
  inExecute,
  and,
  spellCharges,
  not,
  spellAvailable,
  hasResource,
  hasLegendary,
} from 'parser/shared/metrics/apl/conditions';

export const apl = build([
  {
    spell: SPELLS.BARBED_SHOT,
    condition: buffMissing(SPELLS.BARBED_SHOT_PET_BUFF, { timeRemaining: 1000, duration: 8000 }),
  },
  {
    spell: SPELLS.BARBED_SHOT,
    condition: and(
      buffPresent(SPELLS.WILD_SPIRITS_BUFF),
      hasLegendary(SPELLS.FRAGMENTS_OF_THE_ELDER_ANTLERS),
    ),
  },
  {
    spell: SPELLS.TAR_TRAP,
    condition: and(hasLegendary(SPELLS.SOULFORGE_EMBERS_EFFECT), spellAvailable(SPELLS.FLARE)),
  },
  {
    spell: SPELLS.FLARE,
    condition: and(
      hasLegendary(SPELLS.SOULFORGE_EMBERS_EFFECT),
      not(spellAvailable(SPELLS.TAR_TRAP)),
    ),
  },
  SPELLS.BLOODSHED_TALENT,
  SPELLS.WILD_SPIRITS,
  SPELLS.FLAYED_SHOT,
  {
    spell: SPELLS.KILL_SHOT_MM_BM,
    condition: inExecute(0.2),
  },
  {
    spell: SPELLS.KILL_SHOT_MM_BM,
    condition: buffPresent(SPELLS.FLAYERS_MARK),
  },
  SPELLS.WAILING_ARROW_CAST,
  {
    spell: SPELLS.DEATH_CHAKRAM_INITIAL_AND_AOE,
    condition: hasResource(RESOURCE_TYPES.FOCUS, { atMost: 80 }),
  },
  { spell: SPELLS.STAMPEDE_TALENT, condition: buffPresent(SPELLS.ASPECT_OF_THE_WILD) },
  SPELLS.A_MURDER_OF_CROWS_TALENT,
  {
    spell: SPELLS.RESONATING_ARROW,
    condition: buffPresent(SPELLS.BESTIAL_WRATH),
  },
  SPELLS.CHIMAERA_SHOT_TALENT_BEAST_MASTERY,
  SPELLS.KILL_COMMAND_CAST_BM,
  SPELLS.DIRE_BEAST_TALENT,
  {
    spell: SPELLS.COBRA_SHOT,
    condition: or(
      hasResource(RESOURCE_TYPES.FOCUS, { atLeast: 50 }),
      not(spellAvailable(SPELLS.KILL_COMMAND_CAST_BM)),
      buffPresent(SPELLS.BESTIAL_WRATH),
    ),
  },
  {
    spell: SPELLS.BARBED_SHOT,
    condition: or(
      buffPresent(SPELLS.WILD_SPIRITS_BUFF),
      and(
        spellCharges(SPELLS.BARBED_SHOT, { atLeast: 1, atMost: 2 }),
        hasConduit(SPELLS.BLOODLETTING_CONDUIT),
      ),
    ),
  },
  {
    spell: SPELLS.TAR_TRAP,
    condition: or(
      hasLegendary(SPELLS.NESINGWARYS_TRAPPING_APPARATUS_EFFECT),
      hasLegendary(SPELLS.SOULFORGE_EMBERS_EFFECT),
    ),
  },
  {
    spell: SPELLS.FREEZING_TRAP,
    condition: hasLegendary(SPELLS.NESINGWARYS_TRAPPING_APPARATUS_EFFECT),
  },
]);

export const check = aplCheck(apl);

const bmApl = (): WIPSuggestionFactory => (events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
};

export default bmApl;

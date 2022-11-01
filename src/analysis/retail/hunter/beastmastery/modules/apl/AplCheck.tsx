import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { build } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import {
  and,
  buffMissing,
  buffPresent,
  hasConduit,
  hasLegendary,
  hasResource,
  inExecute,
  not,
  or,
  spellAvailable,
  spellCharges,
  spellCooldownRemaining,
  spellFractionalCharges,
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
      spellFractionalCharges(SPELLS.BARBED_SHOT, { atLeast: 1.4 }),
    ),
  },
  {
    spell: SPELLS.FLARE,
    condition: and(
      hasLegendary(SPELLS.SOULFORGE_EMBERS_EFFECT),
      not(spellAvailable(SPELLS.TAR_TRAP, true), false),
    ),
  },
  {
    spell: SPELLS.TAR_TRAP,
    condition: and(
      hasLegendary(SPELLS.SOULFORGE_EMBERS_EFFECT),
      spellCooldownRemaining(SPELLS.FLARE, { atMost: 1500 }),
    ),
  },

  TALENTS.BLOODSHED_TALENT,
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
  { spell: TALENTS.STAMPEDE_TALENT, condition: buffPresent(SPELLS.ASPECT_OF_THE_WILD) },
  TALENTS.A_MURDER_OF_CROWS_TALENT,
  {
    spell: SPELLS.RESONATING_ARROW,
    condition: buffPresent(SPELLS.BESTIAL_WRATH),
  },
  SPELLS.KILL_COMMAND_CAST_BM,
  TALENTS.DIRE_BEAST_TALENT,
  {
    spell: SPELLS.COBRA_SHOT,
    condition: or(
      hasResource(RESOURCE_TYPES.FOCUS, { atLeast: 50 }),
      buffPresent(SPELLS.BESTIAL_WRATH),
    ),
  },
  {
    spell: SPELLS.COBRA_SHOT,
    condition: spellCooldownRemaining(SPELLS.KILL_COMMAND_CAST_BM, { atLeast: 2500 }),
  },
  {
    spell: SPELLS.BARBED_SHOT,
    condition: or(
      buffPresent(SPELLS.WILD_SPIRITS_BUFF),
      and(
        spellCharges(SPELLS.BARBED_SHOT, { atLeast: 1, atMost: 2 })
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

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});

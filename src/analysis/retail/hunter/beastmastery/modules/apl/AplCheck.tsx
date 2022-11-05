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
  hasResource,
  hasTalent,
  inExecute,
  or,
  spellCharges,
  spellCooldownRemaining,
} from 'parser/shared/metrics/apl/conditions';

export const apl = build([
  {
    spell: SPELLS.BARBED_SHOT,
    condition: buffMissing(SPELLS.BARBED_SHOT_PET_BUFF, { timeRemaining: 1000, duration: 8000 }),
  },
  TALENTS.BLOODSHED_TALENT,
  {
    spell: SPELLS.KILL_SHOT_MM_BM,
    condition: inExecute(0.2),
  },
  {
    spell: SPELLS.KILL_SHOT_MM_BM,
    condition: buffPresent(TALENTS.HUNTERS_PREY_TALENT),
  },
  SPELLS.WAILING_ARROW_CAST,
  {
    spell: TALENTS.DEATH_CHAKRAM_TALENT,
    condition: and(
      hasTalent(TALENTS.DEATH_CHAKRAM_TALENT),
      hasResource(RESOURCE_TYPES.FOCUS, { atMost: 80 }),
    ),
  },
  { spell: TALENTS.STAMPEDE_TALENT, condition: buffPresent(SPELLS.ASPECT_OF_THE_WILD) },
  TALENTS.A_MURDER_OF_CROWS_TALENT,
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
    condition: spellCharges(SPELLS.BARBED_SHOT, { atLeast: 1, atMost: 2 }),
  },
]);

export const check = aplCheck(apl);

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});

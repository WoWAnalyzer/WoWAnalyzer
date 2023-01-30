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
    spell: TALENTS.BARBED_SHOT_TALENT,
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
  TALENTS.WAILING_ARROW_TALENT,
  {
    spell: TALENTS.DEATH_CHAKRAM_TALENT,
    condition: and(
      hasTalent(TALENTS.DEATH_CHAKRAM_TALENT),
      hasResource(RESOURCE_TYPES.FOCUS, { atMost: 80 }),
    ),
  },
  TALENTS.A_MURDER_OF_CROWS_TALENT,
  TALENTS.KILL_COMMAND_SHARED_TALENT,
  TALENTS.DIRE_BEAST_TALENT,
  {
    spell: TALENTS.COBRA_SHOT_TALENT,
    condition: or(
      hasResource(RESOURCE_TYPES.FOCUS, { atLeast: 50 }),
      buffPresent(TALENTS.BESTIAL_WRATH_TALENT),
    ),
  },
  {
    spell: TALENTS.COBRA_SHOT_TALENT,
    condition: spellCooldownRemaining(TALENTS.KILL_COMMAND_SHARED_TALENT, { atLeast: 2500 }),
  },
  {
    spell: TALENTS.BARBED_SHOT_TALENT,
    condition: spellCharges(TALENTS.BARBED_SHOT_TALENT, { atLeast: 1, atMost: 2 }),
  },
]);

export const check = aplCheck(apl);

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});

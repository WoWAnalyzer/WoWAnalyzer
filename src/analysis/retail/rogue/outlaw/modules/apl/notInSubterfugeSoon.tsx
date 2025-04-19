import SPELLS from 'common/SPELLS';
import { tenseAlt } from 'parser/shared/metrics/apl';
import { and, buffMissing, describe, buffSoonPresent } from 'parser/shared/metrics/apl/conditions';
import { SpellLink } from 'interface';

export const notInSubterfugeSoon = () => {
  return describe(
    and(
      buffSoonPresent(SPELLS.SUBTERFUGE_BUFF, { atLeast: 1_000 }),
      buffMissing(SPELLS.SUBTERFUGE_BUFF),
    ),
    (tense) => (
      <>
        <SpellLink spell={SPELLS.SUBTERFUGE_BUFF} /> {tenseAlt(tense, 'is', 'was')} missing
      </>
    ),
  );
};

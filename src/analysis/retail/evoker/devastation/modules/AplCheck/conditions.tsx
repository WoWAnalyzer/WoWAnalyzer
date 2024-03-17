import TALENTS from 'common/TALENTS/evoker';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import SPELLS from 'common/SPELLS/evoker';
import { SpellLink } from 'interface';
import { tenseAlt } from 'parser/shared/metrics/apl';
import { OPTIMAL_EMPOWER_DRAGONRAGE_GAP_ST_MS } from '../../constants';

export const avoidIfDragonRageSoon = (time: number = OPTIMAL_EMPOWER_DRAGONRAGE_GAP_ST_MS) => {
  return cnd.describe(
    cnd.buffSoonPresent(TALENTS.DRAGONRAGE_TALENT, {
      atLeast: time,
    }),
    (tense) => (
      <>
        there {tenseAlt(tense, <>is</>, <>was</>)} atleast {time / 1000} seconds left before{' '}
        {tenseAlt(tense, <>using</>, <>you used</>)} <SpellLink spell={TALENTS.DRAGONRAGE_TALENT} />
      </>
    ),
  );
};

export const hasEssenceRequirement = (resources: number, initial: number) => {
  return cnd.always(
    cnd.or(
      cnd.hasResource(RESOURCE_TYPES.ESSENCE, { atLeast: resources }, initial),
      cnd.buffPresent(SPELLS.ESSENCE_BURST_DEV_BUFF),
    ),
  );
};

export const standardEmpowerConditional = cnd.or(
  cnd.describe(cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT), (tense) => (
    <>
      {tenseAlt(tense, <>in</>, <>you were in</>)} <SpellLink spell={TALENTS.DRAGONRAGE_TALENT} />
    </>
  )),
  avoidIfDragonRageSoon(),
);

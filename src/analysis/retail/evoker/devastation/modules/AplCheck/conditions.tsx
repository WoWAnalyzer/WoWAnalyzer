import TALENTS from 'common/TALENTS/evoker';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import SPELLS from 'common/SPELLS/evoker';
import { SpellLink } from 'interface';
import { tenseAlt } from 'parser/shared/metrics/apl';

export const avoidIfDragonRageSoon = (time: number) => {
  return cnd.spellCooldownRemaining(TALENTS.DRAGONRAGE_TALENT, { atLeast: time });
};

export const hasEssenceRequirement = (resources: number, initial: number) => {
  return cnd.always(
    cnd.or(
      cnd.hasResource(RESOURCE_TYPES.ESSENCE, { atLeast: resources }, initial),
      cnd.buffPresent(SPELLS.ESSENCE_BURST_DEV_BUFF),
    ),
  );
};

export const standardEmpowerConditional = cnd.describe(
  cnd.or(cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT), avoidIfDragonRageSoon(13000)),
  (tense) => (
    <>
      {tenseAlt(tense, <>in</>, <>you were in</>)} <SpellLink spell={TALENTS.DRAGONRAGE_TALENT} />{' '}
      or <SpellLink spell={TALENTS.DRAGONRAGE_TALENT} /> {tenseAlt(tense, <>has</>, <>had</>)} at
      least 13 seconds remaining on cooldown
    </>
  ),
);

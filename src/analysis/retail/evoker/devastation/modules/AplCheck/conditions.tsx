import TALENTS from 'common/TALENTS/evoker';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import SPELLS from 'common/SPELLS/evoker';

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

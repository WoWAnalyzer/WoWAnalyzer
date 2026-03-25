import * as cnd from 'parser/shared/metrics/apl/conditions';
import TALENTS from 'common/TALENTS/rogue';
import SPELLS from 'common/SPELLS';
import { tenseAlt } from 'parser/shared/metrics/apl';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

// Checking if Secret Technique should be used during Shadow Dance
export const secretTechniqueDuringDance = cnd.and(
  cnd.buffPresent(SPELLS.SHADOW_DANCE),
  cnd.spellAvailable(SPELLS.SECRET_TECHNIQUE),
);

// Checking if we have 6 or more Combo Points for a finisher
export const sixComboPoints = RESOURCE_TYPES.COMBO_POINTS.id >= 6;

// Checking if Shadow Dance is available for burst
export const shadowDanceAvailable = cnd.spellAvailable(SPELLS.SHADOW_DANCE);

// Checking if major cooldowns are available (Shadow Blades)
export const majorCooldownsAvailable = cnd.and(cnd.spellAvailable(TALENTS.SHADOW_BLADES_TALENT));

// Checking if Symbols of Death should be used outside major cooldowns
export const useSymbolsOfDeath = cnd.or(
  majorCooldownsAvailable,
  cnd.and(cnd.spellAvailable(SPELLS.SECRET_TECHNIQUE), shadowDanceAvailable),
);

// Checking if Backstab or Shuriken Storm should be used as builders
export const builderAbility = cnd.or(
  cnd.and(cnd.buffMissing(SPELLS.SHADOW_DANCE), cnd.spellAvailable(SPELLS.BACKSTAB)),
  cnd.and(cnd.buffPresent(SPELLS.SHADOW_DANCE), cnd.spellAvailable(SPELLS.SHURIKEN_STORM)),
);

// Ensuring Rupture is maintained during downtime
export const maintainRupture = cnd.and(
  cnd.buffMissing(SPELLS.RUPTURE),
  cnd.spellAvailable(SPELLS.RUPTURE),
);

export const cooldownAlignment = cnd.describe(
  cnd.or(useSymbolsOfDeath, secretTechniqueDuringDance, majorCooldownsAvailable),
  (tense) => <>{tenseAlt(tense, 'should', 'should have')} align cooldowns correctly with</>,
);

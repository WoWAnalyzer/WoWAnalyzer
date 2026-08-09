import CoreHaste from 'parser/shared/modules/Haste';
import SPELLS from 'common/SPELLS/classic/deathknight';

/**
 * DK-specific Haste overrides.
 *
 * In the real game, Unholy Presence speeds up rune regen the same way Bloodlust/
 * Berserking/Unholy Frenzy do - unlike the 10% raid melee-speed buff, which
 * only affects melee swing timers and does NOT touch runes. The base Haste module
 * (parser/shared/modules/Haste) has no entry for Unholy Presence at all, so
 * every Frost/Blood DK log spent in Unholy Presence had `MoPRuneTracker`
 * reading rune CDs as a flat 10s instead of ~9.09s before other haste.
 *
 * Unholy spec gets Improved Unholy Presence baked in (10% -> 20%), which is
 * why this lives as a base class here rather than a single flat constant -
 * see the Unholy-spec override in
 * `analysis/classic/deathknight/unholy/modules/features/Haste.ts`.
 *
 * NOT YET DONE: Blood spec has its own analogous passive, Improved Blood
 * Presence - +20% rune regen (Blood
 * Presence's baseline gives 0%, unlike Unholy Presence's baseline 10%) while
 * in Blood Presence, Blood spec only. This should NOT be added to this
 * shared base class (Frost also extends it directly, and would incorrectly
 * inherit a Blood-only bonus) - it needs its own
 * `analysis/classic/deathknight/blood/modules/features/Haste.ts` override
 * file, mirroring the Unholy one, whenever a BloodRuneTracker is added.
 */
class Haste extends CoreHaste {
  override hasteBuffOverrides = {
    [SPELLS.UNHOLY_PRESENCE.id]: 0.1,
  };
}

export default Haste;

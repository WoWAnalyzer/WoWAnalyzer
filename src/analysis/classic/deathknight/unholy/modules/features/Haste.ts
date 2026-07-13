import DKHaste from 'analysis/classic/deathknight/shared/Haste';
import SPELLS from 'common/SPELLS/classic/deathknight';

/**
 * Unholy DK gets Improved Unholy Presence: while in Unholy Presence, the
 * attack-speed (and rune regen) bonus is 20% instead of the base 10% other
 * specs get. See the base DK Haste class for the non-Unholy value.
 */
class Haste extends DKHaste {
  override hasteBuffOverrides = {
    [SPELLS.UNHOLY_PRESENCE.id]: 0.2,
  };
}

export default Haste;

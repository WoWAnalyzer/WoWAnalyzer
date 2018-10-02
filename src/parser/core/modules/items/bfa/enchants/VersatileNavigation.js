import SPELLS from 'common/SPELLS/bfa/enchants';
import Navigation from 'parser/core/modules/items/bfa/enchants/Navigation';

/**
 * Versatile Navigation
 * Permanently enchant a weapon to sometimes increase Versatility by 50 for 30 sec, stacking up to 5 times. Upon reaching 5 stacks, all stacks are consumed to grant you 600 Versatility for 10 sec.
 *
 * Example: https://www.warcraftlogs.com/reports/MNzkd2Kx9TCFwtgH/#fight=last&type=damage-done&source=1
 */
class VersatileNavigation extends Navigation {
  constructor(...args) {
    super(...args);
    this.enchantToTrack = 5962; // Weapon Enchant - Versatile Navigation
    this.smallBuffToTrack = SPELLS.VERSATILE_NAVIGATION_BUFF_SMALL.id;
    this.bigBuffToTrack = SPELLS.VERSATILE_NAVIGATION_BUFF_BIG.id;
    this.primairyStat = 'Versatility';
    this.active = this.hasTrackedEnchant();
  }
}

export default VersatileNavigation;

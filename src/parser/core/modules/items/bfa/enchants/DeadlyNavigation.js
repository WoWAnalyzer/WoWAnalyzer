import SPELLS from 'common/SPELLS/bfa/enchants';
import Navigation from 'parser/core/modules/items/bfa/enchants/Navigation';

/**
 * Deadly Navigation
 * Permanently enchant a weapon to sometimes increase Critical Strike by 50 for 30 sec, stacking up to 5 times. Upon reaching 5 stacks, all stacks are consumed to grant you 600 Critical Strike for 10 sec.
 *
 * Example: https://www.warcraftlogs.com/reports/MNzkd2Kx9TCFwtgH/#fight=last&type=damage-done&source=14
 */
class DeadlyNavigation extends Navigation {
  constructor(...args) {
    super(...args);
    this.enchantToTrack = 5965; // Weapon Enchant - Deadly Navigation
    this.smallBuffToTrack = SPELLS.DEADLY_NAVIGATION_BUFF_SMALL.id;
    this.bigBuffToTrack = SPELLS.DEADLY_NAVIGATION_BUFF_BIG.id;
    this.primairyStat = 'Crit';
    this.active = this.hasTrackedEnchant();
  }
}

export default DeadlyNavigation;

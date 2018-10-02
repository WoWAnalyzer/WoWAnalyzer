import SPELLS from 'common/SPELLS/bfa/enchants';
import Navigation from 'parser/core/modules/items/bfa/enchants/Navigation';

/**
 * Masterful Navigation
 * Permanently enchant a weapon to sometimes increase Mastery by 50 for 30 sec, stacking up to 5 times. Upon reaching 5 stacks, all stacks are consumed to grant you 600 Mastery for 10 sec.
 *
 * Example: https://www.warcraftlogs.com/reports/MNzkd2Kx9TCFwtgH/#fight=last&type=damage-done&source=7
 */
class MasterfulNavigation extends Navigation {
  constructor(...args) {
    super(...args);
    this.enchantToTrack = 5964; // Weapon Enchant - Masterful Navigation
    this.smallBuffToTrack = SPELLS.MASTERFUL_NAVIGATION_BUFF_SMALL.id;
    this.bigBuffToTrack = SPELLS.MASTERFUL_NAVIGATION_BUFF_BIG.id;
    this.primairyStat = 'Mastery';
    this.active = this.hasTrackedEnchant();
  }
}

export default MasterfulNavigation;

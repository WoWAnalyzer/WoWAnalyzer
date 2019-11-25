import SPELLS from 'common/SPELLS/bfa/enchants';
import Navigation from 'parser/shared/modules/items/bfa/enchants/Navigation';

/**
 * Masterful Navigation
 * Permanently enchant a weapon to sometimes increase Mastery by 50 for 30 sec, stacking up to 5 times. Upon reaching 5 stacks, all stacks are consumed to grant you 600 Mastery for 10 sec.
 *
 * Example: https://www.warcraftlogs.com/reports/MNzkd2Kx9TCFwtgH/#fight=last&type=damage-done&source=7
 */
class MasterfulNavigation extends Navigation {
  static enchantId = 5964; // Weapon Enchant - Masterful Navigation
  static smallBuffId = SPELLS.MASTERFUL_NAVIGATION_BUFF_SMALL.id;
  static bigBuffId = SPELLS.MASTERFUL_NAVIGATION_BUFF_BIG.id;
  static primaryStat = 'Mastery';
}

export default MasterfulNavigation;

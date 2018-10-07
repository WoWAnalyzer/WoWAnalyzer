import SPELLS from 'common/SPELLS/bfa/enchants';
import Navigation from 'parser/core/modules/items/bfa/enchants/Navigation';

/**
 * Stalwart Navigation
 * Permanently enchant a weapon to sometimes increase Armor by 50 for 30 sec, stacking up to 5 times. Upon reaching 5 stacks, all stacks are consumed to grant you 600 Armor for 10 sec.
 *
 * Example: https://www.warcraftlogs.com/reports/MNzkd2Kx9TCFwtgH/#fight=last&type=damage-done&source=88
 */
class StalwartNavigation extends Navigation {
    static enchantId = 5966; // Weapon Enchant - Stalwart Navigation
    static smallBuffId = SPELLS.STALWART_NAVIGATION_BUFF_SMALL.id;
    static bigBuffId = SPELLS.STALWART_NAVIGATION_BUFF_BIG.id;
    static primaryStat = 'Armor';
}

export default StalwartNavigation;

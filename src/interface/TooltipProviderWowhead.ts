import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Base from 'interface/BaseTooltipProvider';

class TooltipProviderWowhead extends Base {
  static libraryUrl = '//wow.zamimg.com/widgets/power.js';
  static baseUrl = 'http://wowhead.com/';

  static spellRelative(id: number, details: { ilvl: number }) {
    const base = `spell=${id}`;
    if (!details) {
      return base;
    } else {
      const queryString = [base];
      if (details.ilvl) {
        queryString.push(`ilvl=${details.ilvl}`);
      }
      return queryString.join('&');
    }
  }
  static itemRelative(id: number, details: any) {
    const base = `item=${id}`;
    if (!details) {
      return base;
    } else {
      const queryString = [base];
      if (details.gems && details.gems.length > 0) {
        queryString.push(`gems=${details.gems.map((gem: any) => gem.id).join(':')}`);
      }
      if (details.permanentEnchant) {
        queryString.push(`ench=${details.permanentEnchant}`);
      }
      if (details.bonusIDs && details.bonusIDs.length > 0) {
        queryString.push(`bonus=${details.bonusIDs.join(':')}`);
      }
      return queryString.join('&');
    }
  }
  static resourceRelative(id: number) {
    return RESOURCE_TYPES[id].url;
  }
  static refresh(elem: any) {
    // Doesn't need to refresh because them smarts
  }
}

export default TooltipProviderWowhead;

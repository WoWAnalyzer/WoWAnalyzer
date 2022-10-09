import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Base from 'interface/BaseTooltipProvider';

class TooltipProviderWowhead extends Base {
  static libraryUrl = '//wow.zamimg.com/widgets/power.js';
  static baseUrl = 'https://wowhead.com/';

  static spellRelative(id: number, details: { ilvl?: number; rank?: number }) {
    const base = `spell=${id}`;
    if (!details) {
      return base;
    } else {
      const queryString = [base];
      if (details.ilvl) {
        queryString.push(`ilvl=${details.ilvl}`);
      }
      if (details.rank) {
        // We usually see rank 1 as 1, but wowhead starts at 0
        queryString.push(`rank=${details.rank - 1}`);
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
      if (details.setItemIDs && details.setItemIDs.length > 0) {
        queryString.push(`pcs=${details.setItemIDs.join(':')}`);
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

  static npcRelative(id: number): string {
    return `npc=${id}`;
  }
}

export default TooltipProviderWowhead;

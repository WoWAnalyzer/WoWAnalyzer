import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import Base from './TooltipProviderBase';

class TooltipProviderWowdb extends Base {
  static libraryUrl = '//static-azeroth.cursecdn.com/current/js/syndication/tt.js';
  static baseUrl = 'https://wowdb.com/';

  static spellRelative(id: number) {
    return `spells/${id}`;
  }
  static itemRelative(id: number, details: any) {
    const base = `items/${id}`;
    if (!details) {
      return base;
    } else {
      const queryString = [];
      if (details.gems && details.gems.length > 0) {
        queryString.push(`gems=${details.gems.map((gem: any) => gem.id).join(',')}`);
      }
      if (details.permanentEnchant) {
        queryString.push(`enchantment=${details.permanentEnchant}`);
      }
      if (details.bonusIDs && details.bonusIDs.length > 0) {
        queryString.push(`bonusIDs=${details.bonusIDs.join(',')}`);
      }
      return `${base}?${queryString.join('&')}`;
    }
  }
  static resource(id: number) {
    // Wowdb doesn't have nice pages for resources
    return `https://www.wowhead.com/${RESOURCE_TYPES[id].url}`;
  }
  static refresh(elem: any) {
    // They haven't figured out you can use a document listener yet
    if (elem && 'CurseTips' in window) {
      ((window as unknown) as any).CurseTips['wowdb-tooltip'].watchElements(elem);
    }
  }
}

export default TooltipProviderWowdb;

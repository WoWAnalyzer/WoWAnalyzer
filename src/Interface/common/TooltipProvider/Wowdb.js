import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

import Base from './Base';

class Wowdb extends Base {
  static libraryUrl = '//static-azeroth.cursecdn.com/current/js/syndication/tt.js';
  static baseUrl = 'https://beta.wowdb.com/';

  static spellRelative(id) {
    return `spells/${id}`;
  }
  static itemRelative(id, details) {
    const base = `items/${id}`;
    if (!details) {
      return base;
    } else {
      const queryString = [];
      if (details.gems && details.gems.length > 0) {
        queryString.push(`gems=${details.gems.map(gem => gem.id).join(',')}`);
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
  static resource(id) {
    // Wowdb doesn't have nice pages for resources
    return `http://www.wowhead.com/${RESOURCE_TYPES[id].url}`;
  }
  static refresh(elem) {
    // They haven't figured out you can use a document listener yet
    if (elem && window.CurseTips) {
      window.CurseTips['wowdb-tooltip'].watchElements(elem);
    }
  }
}

export default Wowdb;

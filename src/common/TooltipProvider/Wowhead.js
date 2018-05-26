import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

import Base from './Base';

class Wowhead extends Base {
  static libraryUrl = '//wow.zamimg.com/widgets/power.js';
  static baseUrl = 'http://www.wowhead.com/';

  static spellRelative(id) {
    return `spell=${id}`;
  }
  static itemRelative(id, details) {
    const base = `item=${id}`;
    if (!details) {
      return base;
    } else {
      const queryString = [base];
      if (details.gems && details.gems.length > 0) {
        queryString.push(`gems=${details.gems.map(gem => gem.id).join(':')}`);
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
  static resourceRelative(id) {
    return RESOURCE_TYPES[id].url;
  }
  static refresh(elem) {
    // Doesn't need to refresh because them smarts
  }
}

export default Wowhead;

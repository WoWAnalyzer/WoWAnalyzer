import React from 'react';

import ITEMS from 'common/ITEMS/index';
import Analyzer from 'Parser/Core/Analyzer';

/**
 * Celerity of the Windrunners
 * Equip: Increases your haste by 3%.
 */
class CelerityOfTheWindrunners extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBack(ITEMS.CELERITY_OF_THE_WINDRUNNERS.id);
  }

  item() {
    return {
      item: ITEMS.CELERITY_OF_THE_WINDRUNNERS,
      result: <React.Fragment>Increased your haste by 3%.</React.Fragment>,
    };
  }
}

export default CelerityOfTheWindrunners;

import React from 'react';

import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';

class SoulOfTheShadowblade extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_SHADOWBLADE.id);
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_SHADOWBLADE,
      result: <React.Fragment>Equipped.</React.Fragment>,
    };
  }
}

export default SoulOfTheShadowblade;

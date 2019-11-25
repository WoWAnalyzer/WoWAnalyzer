import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

/*
  Umbral Blaze:
    Your Hand of Guldan has a 15% chance to burn its target for X additional Shadowflame damage every 2 sec for 6 sec.
 */
class UmbralBlaze extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.UMBRAL_BLAZE.id);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.UMBRAL_BLAZE_DEBUFF), this.onUmbralBlazeDamage);
  }

  onUmbralBlazeDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.UMBRAL_BLAZE.id}
        value={<ItemDamageDone amount={this.damage} />}
        tooltip={`${formatThousands(this.damage)} damage`}
      />
    );
  }
}

export default UmbralBlaze;

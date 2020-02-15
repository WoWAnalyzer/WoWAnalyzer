import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import React from 'react';
import ItemDamageDone from 'interface/ItemDamageDone';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

class WildfireCluster extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.WILDFIRE_CLUSTER.id);
  }

  damage = 0;

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.WILDFIRE_CLUSTER_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
        category={'AZERITE_POWERS'}
      >
        <BoringSpellValueText spell={SPELLS.WILDFIRE_CLUSTER}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default WildfireCluster;

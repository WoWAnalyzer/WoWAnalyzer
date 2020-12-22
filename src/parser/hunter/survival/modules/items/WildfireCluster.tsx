import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import React from 'react';
import ItemDamageDone from 'interface/ItemDamageDone';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

/**
 * Wildfire Bomb drops an additional cluster of bombs around the target, each exploding for (33% of Attack power) Fire damage.
 *
 * Example report:
 * https://www.warcraftlogs.com/reports/ayK6THQGAB4Y8h9N#fight=15&type=damage-done&source=1415&translate=true&ability=272745
 */

class WildfireCluster extends Analyzer {

  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.WILDFIRE_CLUSTER_EFFECT.bonusID);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.WILDFIRE_CLUSTER_DAMAGE), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spell={SPELLS.WILDFIRE_CLUSTER_EFFECT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WildfireCluster;

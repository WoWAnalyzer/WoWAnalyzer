import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { MARKMANS_ADVANTAGE_EFFECT_BY_RANK } from 'parser/hunter/shared/constants';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ConduitSpellText from 'interface/statistics/components/ConduitSpellText';
import React from 'react';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import { notableEnemy } from 'parser/shared/modules/hit-tracking/utilities';
import { formatNumber } from 'common/format';

/**
 * Hunter's Mark decreases the damage the target deals to you by x%.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/QR4PmNAWVZ3cBdvw#fight=56&type=summary&source=6
 */
class MarkmansAdvantage extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  conduitRank = 0;
  conduitDR = 0;
  totalDamageReduction = 0;

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.MARKMANS_ADVANTAGE_CONDUIT.id);
    if (!this.active) {
      return;
    }

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(
      SPELLS.MARKMANS_ADVANTAGE_CONDUIT.id,
    );
    this.conduitDR = MARKMANS_ADVANTAGE_EFFECT_BY_RANK[this.conduitRank];

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.damageTaken);
  }

  damageTaken(event: DamageEvent) {
    if (!notableEnemy(this.enemies, event)) {
      return;
    }
    if (!event.unmitigatedAmount || !event.sourceID) {
      return;
    }
    const enemy = this.enemies.getEntities()[event.sourceID];
    if (!enemy.hasBuff(SPELLS.HUNTERS_MARK.id)) {
      return;
    }

    this.totalDamageReduction += event.unmitigatedAmount * this.conduitDR;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spell={SPELLS.MARKMANS_ADVANTAGE_CONDUIT} rank={this.conduitRank}>
          <>
            {formatNumber(this.totalDamageReduction)} <small> damage prevented </small>
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default MarkmansAdvantage;

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import React from 'react';
import Events, { DamageEvent, RemoveDebuffEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import { notableEnemy } from 'parser/shared/modules/hit-tracking/utilities';
import { formatNumber, formatPercentage } from 'common/format';

import { MARKMANS_ADVANTAGE_EFFECT_BY_RANK } from '../constants';

const debug = false;

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
  damageReductionObj: { [key: number]: { damageMitigated: number } } = {};
  totalDamageReduction = 0;
  hmApplied = false;
  potentialDR: { [key: number]: { damageMitigated: number } } = {};

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
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.HUNTERS_MARK),
      this.hmRemoval,
    );
  }

  damageTaken(event: DamageEvent) {
    if (!notableEnemy(this.enemies, event)) {
      return;
    }
    if (!event.unmitigatedAmount || !event.sourceID) {
      return;
    }
    if (!this.hmApplied) {
      this.potentialDR[event.sourceID] = this.potentialDR[event.sourceID] || { damageMitigated: 0 };
      this.potentialDR[event.sourceID].damageMitigated += event.unmitigatedAmount * this.conduitDR;
    } else {
      const enemy = this.enemies.getEntities()[event.sourceID];
      if (!enemy.hasBuff(SPELLS.HUNTERS_MARK.id)) {
        return;
      }
      this.damageReductionObj[event.sourceID] = this.damageReductionObj[event.sourceID] || {
        damageMitigated: 0,
      };
      this.damageReductionObj[event.sourceID].damageMitigated +=
        event.unmitigatedAmount * this.conduitDR;
      this.totalDamageReduction += event.unmitigatedAmount * this.conduitDR;
    }
  }

  hmRemoval(event: RemoveDebuffEvent) {
    if (!this.hmApplied) {
      debug && console.log('No Hunters Mark application detected to be removed.');
      if (this.potentialDR[event.targetID]) {
        this.damageReductionObj[event.targetID] = this.damageReductionObj[event.targetID] || {
          damageMitigated: 0,
        };
        this.damageReductionObj[event.targetID].damageMitigated += this.potentialDR[
          event.targetID
        ].damageMitigated;
        this.totalDamageReduction += this.potentialDR[event.targetID].damageMitigated;
      }
      this.hmApplied = true;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            The conduit reduces damage done by the marked target by{' '}
            {formatPercentage(this.conduitDR, 2)}%.
          </>
        }
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Enemy</th>
                  <th>Mitigated</th>
                  <th>Uptime</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(this.damageReductionObj).map((mob, index) => (
                  <tr key={index}>
                    <td>{this.enemies.getEntities()[Number(mob[0])]._baseInfo.name}</td>
                    <td>{formatNumber(mob[1].damageMitigated)}</td>
                    <td>
                      {formatPercentage(
                        this.enemies
                          .getEntities()
                          [Number(mob[0])].getBuffUptime(SPELLS.HUNTERS_MARK.id) /
                          this.owner.fightDuration,
                      )}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
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

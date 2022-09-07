import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, RemoveDebuffEvent } from 'parser/core/Events';
import Enemies, { encodeTargetString } from 'parser/shared/modules/Enemies';
import { notableEnemy } from 'parser/shared/modules/hit-tracking/utilities';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

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
  damageReductionObj: { [key: string]: { damageMitigated: number } } = {};
  totalDamageReduction = 0;
  hmApplied = false;
  potentialDR: { [key: string]: { damageMitigated: number } } = {};

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

    const id = encodeTargetString(event.sourceID, event.sourceInstance);

    if (!this.hmApplied) {
      this.potentialDR[id] = this.potentialDR[id] || { damageMitigated: 0 };
      this.potentialDR[id].damageMitigated += event.unmitigatedAmount * this.conduitDR;
    } else {
      const enemy = this.enemies.getEntities()[id];
      if (!enemy.hasBuff(SPELLS.HUNTERS_MARK.id)) {
        return;
      }
      this.damageReductionObj[id] = this.damageReductionObj[id] || {
        damageMitigated: 0,
      };
      this.damageReductionObj[id].damageMitigated += event.unmitigatedAmount * this.conduitDR;
      this.totalDamageReduction += event.unmitigatedAmount * this.conduitDR;
    }
  }

  hmRemoval(event: RemoveDebuffEvent) {
    if (!this.hmApplied) {
      const id = encodeTargetString(event.targetID, event.targetInstance);
      debug && console.log('No Hunters Mark application detected to be removed.');
      if (this.potentialDR[id]) {
        this.damageReductionObj[id] = this.damageReductionObj[id] || {
          damageMitigated: 0,
        };
        this.damageReductionObj[id].damageMitigated += this.potentialDR[id].damageMitigated;
        this.totalDamageReduction += this.potentialDR[id].damageMitigated;
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
                    <td>{this.enemies.getEntities()[mob[0]]._baseInfo.name}</td>
                    <td>{formatNumber(mob[1].damageMitigated)}</td>
                    <td>
                      {formatPercentage(
                        this.enemies.getEntities()[mob[0]].getBuffUptime(SPELLS.HUNTERS_MARK.id) /
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
        <ConduitSpellText spellId={SPELLS.MARKMANS_ADVANTAGE_CONDUIT.id} rank={this.conduitRank}>
          <>
            {formatNumber(this.totalDamageReduction)} <small> damage prevented </small>
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default MarkmansAdvantage;

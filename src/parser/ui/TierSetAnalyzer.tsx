import type { ReactNode } from 'react';
import Analyzer from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import { type TIER_GEAR_IDS } from 'common/ITEMS';
import Statistic from 'parser/ui/Statistic';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringItemSetValueText from 'parser/ui/BoringItemSetValueText';
import { formatNumber } from 'common/format';

/**
 * Base class for tier set analyzer modules. Provides a standardized `statistic()`
 * implementation; subclasses accumulate values and optionally override tooltip content.
 *
 * Usage:
 *   - Declare `readonly setId`, `readonly setTitle`, `readonly tier` as class fields.
 *   - Increment `this.twoPieceHealing` / `this.twoPieceDamage` etc. in event handlers.
 *     Rows are hidden automatically when their value is 0
 *   - Override `tooltip2pcItems` / `tooltip4pcItems` to provide a custom breakdown.
 */
abstract class TierSetAnalyzer extends Analyzer {
  abstract readonly setId: TIER_GEAR_IDS;
  abstract readonly setTitle: string;
  abstract readonly tier: TIERS;

  protected twoPieceHealing = 0;
  protected twoPieceDamage = 0;
  protected fourPieceHealing = 0;
  protected fourPieceDamage = 0;

  protected get show2pcHealing(): boolean {
    return this.twoPieceHealing > 0;
  }
  protected get show2pcDamage(): boolean {
    return this.twoPieceDamage > 0;
  }
  protected get show4pcHealing(): boolean {
    return this.fourPieceHealing > 0;
  }
  protected get show4pcDamage(): boolean {
    return this.fourPieceDamage > 0;
  }

  protected get hasFourPiece(): boolean {
    return this.selectedCombatant.has4PieceByTier(this.tier);
  }

  /** Override to replace the default "2pc Healing / 2pc Damage" tooltip lines. */
  protected get tooltip2pcItems(): ReactNode {
    return (
      <>
        {this.show2pcHealing && (
          <li>
            <strong>2pc Healing:</strong> {formatNumber(this.twoPieceHealing)}
          </li>
        )}
        {this.show2pcDamage && (
          <li>
            <strong>2pc Damage:</strong> {formatNumber(this.twoPieceDamage)}
          </li>
        )}
      </>
    );
  }

  /** Override to replace the default "4pc Healing / 4pc Damage" tooltip lines. */
  protected get tooltip4pcItems(): ReactNode {
    return (
      <>
        {this.show4pcHealing && (
          <li>
            <strong>4pc Healing:</strong> {formatNumber(this.fourPieceHealing)}
          </li>
        )}
        {this.show4pcDamage && (
          <li>
            <strong>4pc Damage:</strong> {formatNumber(this.fourPieceDamage)}
          </li>
        )}
      </>
    );
  }

  statistic() {
    const has4pc = this.hasFourPiece;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <ul>
            {this.tooltip2pcItems}
            {has4pc && this.tooltip4pcItems}
          </ul>
        }
      >
        <BoringItemSetValueText setId={this.setId} title={this.setTitle}>
          <div>2pc:</div>
          {this.show2pcHealing && (
            <div>
              <ItemHealingDone amount={this.twoPieceHealing} />
            </div>
          )}
          {this.show2pcDamage && (
            <div>
              <ItemDamageDone amount={this.twoPieceDamage} />
            </div>
          )}
          {has4pc && (
            <>
              <hr />
              <div>4pc:</div>
              {this.show4pcHealing && (
                <div>
                  <ItemHealingDone amount={this.fourPieceHealing} />
                </div>
              )}
              {this.show4pcDamage && (
                <div>
                  <ItemDamageDone amount={this.fourPieceDamage} />
                </div>
              )}
            </>
          )}
        </BoringItemSetValueText>
      </Statistic>
    );
  }
}

export default TierSetAnalyzer;

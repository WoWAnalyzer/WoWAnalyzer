import ITEMS from 'common/ITEMS';
import talents from 'common/TALENTS/shaman';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { isFrom4pcT31 } from '../../normalizers/CastLinkNormalizer';
import { SHAMAN_DF3_ID } from 'common/ITEMS/dragonflight';
import { SpellLink } from 'interface';
import ItemSetLink from 'interface/ItemSetLink';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import { formatNumber, formatPercentage } from 'common/format';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import RiptideTracker from '../core/RiptideTracker';
import Combatants from 'parser/shared/modules/Combatants';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';

const RIPTIDE_4P_POWER = 0.25; // Riptide bonus power = 25%

/**
 * **Resto Shaman T31 (Amirdrassil)**
 *
 * 2pc: Chain Heal, Healing Surge, and Healing Wave mark their initial target with a Tidal Reservoir, causing them to receive 15% of all Riptide healing you deal for 15 sec.
 *
 * 4pc : Riptide's healing is increased by 25%. If Riptide is active on the same target as Tidal Reservoir, its heal over time effect has a 6% chance to create a new Riptide on a nearby ally.
 */

export default class Tier31 extends Analyzer {
  static dependencies = {
    riptideTracker: RiptideTracker,
    combatants: Combatants,
  };
  protected riptideTracker!: RiptideTracker;
  protected combatants!: Combatants;
  has4pc: boolean;
  tidalReservoirHealing: number = 0;
  tidalReservoirOverhealing: number = 0;
  bonus4pcRiptideHealing: number = 0;
  percent4pcRiptideHealing: number = 0;
  bonus4pcRiptideAmount: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.DF3);
    this.has4pc = this.selectedCombatant.has4PieceByTier(TIERS.DF3);

    if (this.has4pc) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(talents.RIPTIDE_TALENT),
        this.handleRiptideHeal,
      );
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(ITEMS.T31_TIDAL_RESERVOIR_HEAL),
      this.on2pcHeal,
    );
  }

  get twoPieceOverhealPercent() {
    return formatPercentage(
      this.tidalReservoirOverhealing /
        (this.tidalReservoirHealing + this.tidalReservoirOverhealing),
    );
  }

  get fourPieceTotalHealing() {
    return this.bonus4pcRiptideHealing + this.percent4pcRiptideHealing;
  }

  on2pcHeal(event: HealEvent) {
    this.tidalReservoirHealing += event.amount + (event.absorbed || 0);
    this.tidalReservoirOverhealing += event.overheal || 0;
  }

  handleRiptideHeal(event: HealEvent) {
    if (isFrom4pcT31(event)) {
      // Bonus riptide from the 4pc => tally the Riptide for the tooltip and count all healing as provided by the 4pc
      this.bonus4pcRiptideHealing += event.amount + (event.absorbed || 0);
      if (!event.tick) {
        this.bonus4pcRiptideAmount += 1;
      }
    } else {
      // Regular Riptide => count only the bonus 25% as provided by the 4pc
      this.percent4pcRiptideHealing += calculateEffectiveHealing(event, RIPTIDE_4P_POWER);
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <ul>
              <li>
                <SpellLink spell={ITEMS.T31_TIDAL_RESERVOIR_HEAL} />:{' '}
                <strong>{formatNumber(this.tidalReservoirHealing)}</strong> (
                {this.twoPieceOverhealPercent}% Overheal)
              </li>
              {this.has4pc && (
                <>
                  <li>
                    <strong>{formatNumber(this.bonus4pcRiptideHealing)}</strong> from{' '}
                    {formatNumber(this.bonus4pcRiptideAmount)} bonus
                    <SpellLink spell={talents.RIPTIDE_TALENT} />
                    {this.bonus4pcRiptideAmount > 1 && 's'}
                  </li>
                  <li>
                    Increased
                    <SpellLink spell={talents.RIPTIDE_TALENT} /> healing:{' '}
                    <strong>{formatNumber(this.percent4pcRiptideHealing)}</strong>
                  </li>
                </>
              )}
            </ul>
          </>
        }
      >
        <div className="pad boring-text">
          <label>
            <ItemSetLink id={SHAMAN_DF3_ID}>
              <>
                Vision of the Greatwolf Outcast
                <br />
                (T31 Tier Set)
              </>
            </ItemSetLink>
          </label>
          <div className="value">
            <h4>2 Piece</h4>
            <ItemHealingDone amount={this.tidalReservoirHealing} />
          </div>
          <hr />
          {this.has4pc && (
            <div className="value">
              <h4>4 Piece</h4>
              <ItemHealingDone amount={this.fourPieceTotalHealing} />
            </div>
          )}
        </div>
      </Statistic>
    );
  }
}

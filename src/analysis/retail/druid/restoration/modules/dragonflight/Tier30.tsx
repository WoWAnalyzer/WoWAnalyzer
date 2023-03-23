import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import SPELLS from 'common/SPELLS';
import { FLOURISH_INCREASED_RATE } from 'analysis/retail/druid/restoration/constants';
import ItemSetLink from 'interface/ItemSetLink';
import { SpellLink } from 'interface';
import { TALENTS_DRUID } from 'common/TALENTS';
import { DRUID_T30_ID } from 'common/ITEMS/dragonflight';
import { TIERS } from 'game/TIERS';

const TIER_2PC_REJUV_BOOST = 0.15;
const TIER_2PC_LB_BOOST = 0.15;
const TIER_2PC_REGROWTH_BOOST = 0.75;

const TIER_4PC_HEALING_INCREASE = 0.4;

/**
 * **Resto Druid T30 (Aberrus)**
 *
 * 2pc: Rejuvenation and Lifebloom healing increased by 15%. Regrowth healing over time increased by 75%.
 *
 * 4pc: Flourish increases the rate of your heal over time effects by 40% for an additional 16 seconds after it ends.
 *   Verdant Infusion causes your Swiftmend target to gain 15% increased healing from you for 6 seconds.
 */
export default class Tier30 extends Analyzer {
  has4pc: boolean;

  rejuv2pcHealing: number = 0;
  lb2pcHealing: number = 0;
  regrowth2pcHealing: number = 0;
  total4pcHealing: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T30);
    this.has4pc = this.selectedCombatant.has4PieceByTier(TIERS.T30);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION]),
      this.onRejuvHeal,
    );
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.LIFEBLOOM_HOT_HEAL,
          SPELLS.LIFEBLOOM_UNDERGROWTH_HOT_HEAL,
          SPELLS.LIFEBLOOM_BLOOM_HEAL,
        ]),
      this.onLbHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onRegrowthHeal,
    );

    if (this.has4pc) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(FLOURISH_INCREASED_RATE),
        this.on4pcHeal,
      );
    }
  }

  onRejuvHeal(event: HealEvent) {
    this.rejuv2pcHealing += calculateEffectiveHealing(event, TIER_2PC_REJUV_BOOST);
  }

  onLbHeal(event: HealEvent) {
    this.lb2pcHealing += calculateEffectiveHealing(event, TIER_2PC_LB_BOOST);
  }

  onRegrowthHeal(event: HealEvent) {
    if (event.tick) {
      this.regrowth2pcHealing += calculateEffectiveHealing(event, TIER_2PC_REGROWTH_BOOST);
    }
  }

  on4pcHeal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.TENACIOUS_FLOURISHING.id) && event.tick) {
      this.total4pcHealing += calculateEffectiveHealing(event, TIER_4PC_HEALING_INCREASE);
    }
  }

  get total2pcHealing() {
    return this.rejuv2pcHealing + this.regrowth2pcHealing + this.lb2pcHealing;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            2-Piece healing breakdown:
            <ul>
              <li>
                <SpellLink id={SPELLS.REJUVENATION.id} />:{' '}
                <strong>{this.owner.formatItemHealingDone(this.rejuv2pcHealing)}</strong>
              </li>
              <li>
                <SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} />:{' '}
                <strong>{this.owner.formatItemHealingDone(this.lb2pcHealing)}</strong>
              </li>
              <li>
                <SpellLink id={SPELLS.REGROWTH.id} />:{' '}
                <strong>{this.owner.formatItemHealingDone(this.regrowth2pcHealing)}</strong>
              </li>
            </ul>
            {this.has4pc && (
              <>
                The 4-Piece number includes only the healing directly caused by the faster tick
                rate. It does <i>not</i> include second-order benefits of faster ticks such as more{' '}
                <SpellLink id={TALENTS_DRUID.OMEN_OF_CLARITY_RESTORATION_TALENT.id} />, more{' '}
                <SpellLink id={TALENTS_DRUID.PHOTOSYNTHESIS_TALENT.id} /> procs, more{' '}
                <SpellLink id={TALENTS_DRUID.LUXURIANT_SOIL_TALENT.id} /> procs, etc.
              </>
            )}
            <br />
          </>
        }
      >
        <div className="pad boring-text">
          <label>
            <ItemSetLink id={DRUID_T30_ID}>
              <>
                Strands of the Autumn Blaze
                <br />
                (Aberrus Tier)
              </>
            </ItemSetLink>
          </label>
          <div className="value">
            2pc: <ItemPercentHealingDone amount={this.total2pcHealing} />
          </div>
          {this.has4pc && (
            <>
              <div className="value">
                4pc: <ItemPercentHealingDone greaterThan amount={this.total4pcHealing} />
              </div>
            </>
          )}
        </div>
      </Statistic>
    );
  }
}

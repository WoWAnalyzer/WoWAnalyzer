import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TIERS } from 'game/TIERS';
import Spell from 'common/SPELLS/Spell';
import Events from 'parser/core/Events';
import { DamageEvent } from 'parser/core/Events';
import { effectiveDamage } from 'parser/shared/modules/DamageValue';
import SPELLS from 'common/SPELLS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import Statistic from 'parser/ui/Statistic';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { TALENTS_DRUID } from 'common/TALENTS';
import ItemSetLink from 'interface/ItemSetLink';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import { DRUID_TWW2_ID } from 'common/ITEMS';

const CONSUME_BUFFER_MS = 50;

const WINNING_STREAK_BOOST_PER_STACK = 0.03;
const WINNING_STREAK_BUFFED_SPELLS: Spell[] = [
  SPELLS.FEROCIOUS_BITE,
  SPELLS.RAVAGE_DOTC_CAT,
  TALENTS_DRUID.PRIMAL_WRATH_TALENT,
  SPELLS.RIP,
  SPELLS.RAMPANT_FEROCITY,
];

const BIG_WINNER_DOT_BOOST = 0.16;
const BIG_WINNER_BUFFED_SPELLS: Spell[] = [
  SPELLS.THRASH_FERAL,
  SPELLS.THRASH_FERAL_BLEED,
  SPELLS.RIP,
  SPELLS.RAKE,
  SPELLS.RAKE_BLEED,
  TALENTS_DRUID.FERAL_FRENZY_TALENT,
  SPELLS.ADAPTIVE_SWARM_DAMAGE,
  SPELLS.BLOODSEEKER_VINES,
  SPELLS.DREADFUL_WOUND,
];

/**
 * **Roots of Reclaiming Blight**
 * Liberation of Undermine (TWW S2) Tier Set
 *
 * 2pc - Your spells and abilities have a chance to activate a Winning Streak! increasing the damage
 * of your Ferocious Bite, Rip, and Primal Wrath by 3% stacking up to 10 times.
 * Ferocious Bite, Rip, and Primal Wrath have a 15% chance to remove Winning Streak!.
 * Free Ferocious Bites are exempt from this chance.
 *
 * 4pc - When you consume Apex Predator's Craving, become a Big Winner, dealing X Physical damage to
 * Apex Predator's primary target and increasing the damage of your periodic effects by 16% for 6 sec.
 */
export default class TWW2TierSet extends Analyzer {
  has4pc: boolean;

  winningStreakBuffDamage = 0;
  bigWinnerDirectDamage = 0;
  bigWinnerBuffDamage = 0;

  // for calculating damage weighted avg stacks
  totalBaseWinningStreakDamageTimesStacks = 0;
  totalBaseWinningStreakDamage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has2PieceByTier(TIERS.TWW2);
    this.has4pc = this.selectedCombatant.has4PieceByTier(TIERS.TWW2);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(WINNING_STREAK_BUFFED_SPELLS),
      this.onWinningStreakBuffedDamage,
    );
    if (this.has4pc) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FERAL_DRUID_BIG_WINNER),
        this.onBigWinnerDirectDamage,
      );
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(BIG_WINNER_BUFFED_SPELLS),
        this.onBigWinnerBuffedDamage,
      );
    }
  }

  onWinningStreakBuffedDamage(event: DamageEvent) {
    const stacks = this.selectedCombatant.getBuffStacks(
      SPELLS.FERAL_DRUID_WINNING_STREAK,
      null,
      CONSUME_BUFFER_MS,
    );
    const boost = stacks * WINNING_STREAK_BOOST_PER_STACK;
    this.winningStreakBuffDamage += calculateEffectiveDamage(event, boost);

    const baseDamage = effectiveDamage(event) / (1 + boost);
    this.totalBaseWinningStreakDamage += baseDamage;
    this.totalBaseWinningStreakDamageTimesStacks += baseDamage * stacks;
  }

  onBigWinnerDirectDamage(event: DamageEvent) {
    this.bigWinnerDirectDamage += effectiveDamage(event);
  }

  onBigWinnerBuffedDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.FERAL_DRUID_BIG_WINNER)) {
      this.bigWinnerBuffDamage += calculateEffectiveDamage(event, BIG_WINNER_DOT_BOOST);
    }
  }

  get total2PcDamage() {
    return this.winningStreakBuffDamage;
  }

  get total4PcDamage() {
    return this.bigWinnerDirectDamage + this.bigWinnerBuffDamage;
  }

  get avgStacks() {
    if (this.totalBaseWinningStreakDamage === 0) {
      return 'N/A';
    }
    return (
      this.totalBaseWinningStreakDamageTimesStacks / this.totalBaseWinningStreakDamage
    ).toFixed(1);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <p>
              Average <SpellLink spell={SPELLS.FERAL_DRUID_WINNING_STREAK} /> stacks (damage
              weighted): <strong>{this.avgStacks}</strong>
            </p>
            {this.has4pc && (
              <p>
                <SpellLink spell={SPELLS.FERAL_DRUID_BIG_WINNER} /> breakdown:
                <ul>
                  <li>
                    Direct:{' '}
                    <strong>
                      {formatPercentage(
                        this.owner.getPercentageOfTotalDamageDone(this.bigWinnerDirectDamage),
                      )}
                      %
                    </strong>
                  </li>
                  <li>
                    DoT Boost:{' '}
                    <strong>
                      {formatPercentage(
                        this.owner.getPercentageOfTotalDamageDone(this.bigWinnerBuffDamage),
                      )}
                      %
                    </strong>
                  </li>
                </ul>
              </p>
            )}
          </>
        }
      >
        <div className="pad boring-text">
          <label>
            <ItemSetLink id={DRUID_TWW2_ID}>
              <>
                Roots of Reclaiming Blight
                <br />
                (TWW S2 Set)
              </>
            </ItemSetLink>
          </label>
          <div className="value">
            2pc: <ItemPercentDamageDone amount={this.total2PcDamage} />
            <br />
            4pc:{' '}
            {this.has4pc ? <ItemPercentDamageDone amount={this.total4PcDamage} /> : 'Not Equipped'}
          </div>
        </div>
      </Statistic>
    );
  }
}

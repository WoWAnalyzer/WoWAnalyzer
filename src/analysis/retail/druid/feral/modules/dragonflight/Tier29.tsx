import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import ItemSetLink from 'interface/ItemSetLink';
import { DRUID_DF1_ID } from 'common/ITEMS/dragonflight';
import { TALENTS_DRUID } from 'common/TALENTS';
import { CONVOKE_FB_CPS, FINISHERS, MAX_CPS } from 'analysis/retail/druid/feral/constants';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';
import HIT_TYPES from 'game/HIT_TYPES';
import StatTracker from 'parser/shared/modules/StatTracker';

const BOOSTED_2PC = [
  SPELLS.FEROCIOUS_BITE,
  SPELLS.RIP,
  SPELLS.RAMPANT_FEROCITY,
  SPELLS.TEAR,
  SPELLS.TEAR_OPEN_WOUNDS,
];
const BOOST_AMOUNT_2PC = 0.06;

const DAMAGE_BOOSTED_4PC = [
  SPELLS.RIP,
  SPELLS.TEAR,
  SPELLS.TEAR_OPEN_WOUNDS,
  SPELLS.RAKE,
  SPELLS.RAKE_BLEED,
  SPELLS.THRASH_FERAL,
  SPELLS.THRASH_FERAL_BLEED,
];
const CRIT_BOOSTED_4PC = [
  SPELLS.SHRED,
  SPELLS.RAKE,
  SPELLS.RAKE_BLEED,
  TALENTS_DRUID.BRUTAL_SLASH_TALENT,
  SPELLS.SWIPE_CAT,
  SPELLS.THRASH_FERAL,
  SPELLS.THRASH_FERAL_BLEED,
];
const BOOST_AMOUNT_PER_CP_4PC = 0.02;

/**
 * Feral Druid T29
 * 2pc: Ferocious Bite and Rip deal 6% additional damage.
 * 4pc: For each combo point spent, finishing moves increase your Rip, Rake, and Thrash damage
 *      by 2% and increase the chance for Shred, Rake, Brutal Slash, Swipe, and Thrash to
 *      Critically Strike by 2% for 4 sec.
 */
export default class Tier29 extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  statTracker!: StatTracker;

  has4pc: boolean;

  total2pcDamage: number = 0;
  total4pcDamage: number = 0;
  total4pcCps: number = 0;

  current4pcBoostStrength: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has2PieceByTier(TIERS.DF1);
    this.has4pc = this.selectedCombatant.has4PieceByTier(TIERS.DF1);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(BOOSTED_2PC), this.on2pcDamage);
    if (this.has4pc) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(DAMAGE_BOOSTED_4PC),
        this.on4pcDamageBoosted,
      );
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(CRIT_BOOSTED_4PC),
        this.on4pcCritBoosted,
      );
      // track strength of 4pc buff from most recent CP spend
      this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FINISHERS), this.onFinisher);
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE),
        this.onBiteDamage,
      );
    }
  }

  on2pcDamage(event: DamageEvent) {
    this.total2pcDamage += calculateEffectiveDamage(event, BOOST_AMOUNT_2PC);
  }

  on4pcDamageBoosted(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.SHARPENED_CLAWS.id)) {
      this.total4pcDamage += calculateEffectiveDamage(event, this.current4pcBoostStrength);
    }
  }

  on4pcCritBoosted(event: DamageEvent) {
    if (
      event.hitType === HIT_TYPES.CRIT &&
      this.current4pcBoostStrength !== 0 &&
      this.selectedCombatant.hasBuff(SPELLS.SHARPENED_CLAWS.id)
    ) {
      const chanceDueTo4pc =
        this.current4pcBoostStrength /
        (this.current4pcBoostStrength + this.statTracker.currentCritPercentage);
      if (!event.tick) {
        this.total4pcCps += chanceDueTo4pc;
      }
      this.total4pcDamage += ((event.amount + (event.absorbed || 0)) / 2) * chanceDueTo4pc;
    }
  }

  onFinisher(event: CastEvent) {
    // a finisher cast with 0 CPs spent is an APC bite, which counts as though it had max
    this.update4pcStrength(getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS) || MAX_CPS);
  }

  onBiteDamage(_: DamageEvent) {
    if (isConvoking(this.selectedCombatant)) {
      this.update4pcStrength(CONVOKE_FB_CPS);
    }
  }

  update4pcStrength(cpsSpent: number) {
    this.current4pcBoostStrength = BOOST_AMOUNT_PER_CP_4PC * cpsSpent;
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
              The 2pc damage amount includes both the directly boosted spells (Rip and Ferocious
              Bite) and the indirectly boosted ones (Tear, Tear Open Wounds, Ramapnt Ferocity).
            </p>
            {this.has4pc && (
              <p>
                The 4pc damage includes amount includes the directly boosted spell damage and the
                expected increased damage from additional crits. It does NOT include the extra CPs
                you get from the additional crits, hence the 'greater than' sign.
                <br />
                <br />
                Additional CPs due to 4pc additional crits (approximate):{' '}
                <strong>{this.owner.getPerMinute(this.total4pcCps).toFixed(1)} per minute</strong>
              </p>
            )}
          </>
        }
      >
        <div className="pad boring-text">
          <label>
            <ItemSetLink id={DRUID_DF1_ID}>Lost Landcaller's Vesture (VotI Tier)</ItemSetLink>
          </label>
          <div className="value">
            2pc: <ItemPercentDamageDone amount={this.total2pcDamage} />
          </div>
          {this.has4pc && (
            <div className="value">
              4pc: <ItemPercentDamageDone greaterThan amount={this.total4pcDamage} />
            </div>
          )}
        </div>
      </Statistic>
    );
  }
}

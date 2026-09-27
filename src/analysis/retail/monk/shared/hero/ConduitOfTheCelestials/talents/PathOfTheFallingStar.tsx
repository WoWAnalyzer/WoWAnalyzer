import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { formatNumber, formatPercentage } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import {
  PATH_OF_THE_FALLING_STAR_INCREASE,
  PATH_OF_THE_FALLING_STAR_REDUCTION_PER_TARGET,
} from '../constants';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// a single tick can be logged a millisecond apart, so its events are gathered before counting
const TICK_TOLERANCE_MS = 100;
// the first target count where the bonus has fully decayed
const NO_BONUS_TARGET_COUNT =
  Math.ceil(PATH_OF_THE_FALLING_STAR_INCREASE / PATH_OF_THE_FALLING_STAR_REDUCTION_PER_TARGET) + 1;

interface ConduitTick {
  timestamp: number;
  healTargets: Set<number>;
  damageTargets: Set<number>;
  heals: HealEvent[];
  damage: DamageEvent[];
}

class PathOfTheFallingStar extends Analyzer {
  talent = TALENTS_MONK.PATH_OF_THE_FALLING_STAR_TALENT;
  healing = 0;
  damage = 0;
  healTicksByTargetCount = new Map<number, number>();
  damageTicksByTargetCount = new Map<number, number>();
  private tick: ConduitTick | undefined;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(this.talent);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CELESTIAL_CONDUIT_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CELESTIAL_CONDUIT_HEAL),
      this.onHeal,
    );
    this.addEventListener(Events.fightend, this.settleTick);
  }

  private currentTick(timestamp: number): ConduitTick {
    if (!this.tick || timestamp - this.tick.timestamp > TICK_TOLERANCE_MS) {
      this.settleTick();
      this.tick = {
        timestamp,
        healTargets: new Set(),
        damageTargets: new Set(),
        heals: [],
        damage: [],
      };
    }
    return this.tick;
  }

  private onDamage(event: DamageEvent) {
    const tick = this.currentTick(event.timestamp);
    tick.damageTargets.add(event.targetID);
    tick.damage.push(event);
  }

  private onHeal(event: HealEvent) {
    const tick = this.currentTick(event.timestamp);
    tick.healTargets.add(event.targetID);
    tick.heals.push(event);
  }

  private settleTick = () => {
    if (!this.tick) {
      return;
    }
    const { heals, damage, healTargets, damageTargets } = this.tick;
    if (heals.length > 0) {
      const increase = this.bonusFor(healTargets.size);
      this.countTick(this.healTicksByTargetCount, healTargets.size);
      if (increase > 0) {
        heals.forEach((event) => {
          this.healing += calculateEffectiveHealing(event, increase);
        });
      }
    }
    if (damage.length > 0) {
      const increase = this.bonusFor(damageTargets.size);
      this.countTick(this.damageTicksByTargetCount, damageTargets.size);
      if (increase > 0) {
        damage.forEach((event) => {
          this.damage += calculateEffectiveDamage(event, increase);
        });
      }
    }
    this.tick = undefined;
  };

  private countTick(ticks: Map<number, number>, targets: number) {
    ticks.set(targets, (ticks.get(targets) || 0) + 1);
  }

  private bonusFor(targets: number) {
    return Math.max(
      0,
      PATH_OF_THE_FALLING_STAR_INCREASE -
        (targets - 1) * PATH_OF_THE_FALLING_STAR_REDUCTION_PER_TARGET,
    );
  }

  private breakdown(ticks: Map<number, number>) {
    const rows = Array.from(ticks.keys())
      .filter((targets) => this.bonusFor(targets) > 0)
      .sort((a, b) => a - b)
      .map((targets) => (
        <li key={targets}>
          {targets} target{targets === 1 ? '' : 's'}: {formatNumber(ticks.get(targets) || 0)} tick
          {ticks.get(targets) === 1 ? '' : 's'} at {formatPercentage(this.bonusFor(targets), 0)}%
          bonus
        </li>
      ));
    const noBonus = Array.from(ticks.entries())
      .filter(([targets]) => this.bonusFor(targets) === 0)
      .reduce((sum, [, count]) => sum + count, 0);
    if (noBonus > 0) {
      rows.push(
        <li key="none">
          {NO_BONUS_TARGET_COUNT} or more targets: {formatNumber(noBonus)} tick
          {noBonus === 1 ? '' : 's'} at no bonus
        </li>,
      );
    }
    return rows;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            {this.healTicksByTargetCount.size > 0 && (
              <>
                <strong>Healing</strong>
                <ul>{this.breakdown(this.healTicksByTargetCount)}</ul>
              </>
            )}
            {this.damageTicksByTargetCount.size > 0 && (
              <>
                <strong>Damage</strong>
                <ul>{this.breakdown(this.damageTicksByTargetCount)}</ul>
              </>
            )}
          </>
        }
      >
        <TalentSpellText talent={this.talent}>
          <div>
            <ItemHealingDone amount={this.healing} />
          </div>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PathOfTheFallingStar;

import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import {
  calculateEffectiveDamage,
  calculateEffectiveDamageFromCritIncrease,
  calculateEffectiveDamageReduction,
  calculateEffectiveHealing,
  calculateEffectiveHealingFromCritIncrease,
} from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent, EventType, HealEvent } from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

const DESPAIR_CRIT_INCREASE = 0.3;
const DOUBT_INCREASE = 0.35;
const FEAR_HASTE_INCREASE = 0.25;
const FEAR_MITIGATION_PERCENT = 0.15;

class ShaohaosLessons extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  angerDamage: number = 0;
  angerHealing: number = 0;
  despairDamage: number = 0;
  despairHealing: number = 0;
  doubtDamage: number = 0;
  doubtHealing: number = 0;
  curHpPercent: number = 0;
  fearMitigated: number = 0;
  protected statTracker!: StatTracker;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.SHAOHAOS_LESSONS_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LESSON_OF_ANGER_HEAL),
      this.handleHealAnger,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.LESSON_OF_ANGER_DAMAGE),
      this.handleDamageAnger,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleHealDoubt);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.handleDamageDoubt);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleDespair);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.handleDespair);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.healTaken);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.damageTaken);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.handleCast);
  }

  handleCast(event: CastEvent) {
    this.curHpPercent = event.hitPoints! / event.maxHitPoints!;
  }

  healTaken(event: HealEvent) {
    this.curHpPercent = event.hitPoints / event.maxHitPoints;
  }

  damageTaken(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.LESSON_OF_FEAR_BUFF.id)) {
      this.fearMitigated += calculateEffectiveDamageReduction(event, FEAR_MITIGATION_PERCENT);
    }
    this.curHpPercent = event.hitPoints! / event.maxHitPoints!;
  }

  handleDamageAnger(event: DamageEvent) {
    this.angerDamage += event.amount + (event.absorbed || 0);
  }

  handleHealAnger(event: HealEvent) {
    this.angerHealing += event.amount + (event.absorbed || 0);
  }

  handleHealDoubt(event: HealEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.LESSON_OF_DOUBT_BUFF.id)) {
      return;
    }
    const targetPlayerHealthPercent = (event.hitPoints - event.amount) / event.maxHitPoints;
    const healingBuff = (1 - targetPlayerHealthPercent) * DOUBT_INCREASE;
    this.doubtHealing += calculateEffectiveHealing(event, healingBuff);
  }

  handleDamageDoubt(event: DamageEvent) {
    if (
      !event.hitPoints ||
      !event.maxHitPoints ||
      !this.selectedCombatant.hasBuff(SPELLS.LESSON_OF_DOUBT_BUFF.id)
    ) {
      return;
    }
    const enemyHealthPercent = (event.hitPoints - event.amount) / event.maxHitPoints;
    const damageIncrease = (1 - enemyHealthPercent) * DOUBT_INCREASE;
    this.doubtDamage += calculateEffectiveDamage(event, damageIncrease);
  }

  handleDespair(event: HealEvent | DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.LESSON_OF_DESPAIR_BUFF.id)) {
      return;
    }
    if (this.curHpPercent < 0.5 || event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    if (event.type === EventType.Heal) {
      this.despairHealing += calculateEffectiveHealingFromCritIncrease(
        event,
        this.statTracker.currentCritPercentage,
        DESPAIR_CRIT_INCREASE,
      );
    } else {
      this.despairDamage += calculateEffectiveDamageFromCritIncrease(
        event,
        this.statTracker.currentCritPercentage,
        DESPAIR_CRIT_INCREASE,
      );
    }
  }

  get totalDamage() {
    return this.angerDamage + this.despairDamage + this.doubtDamage;
  }

  get totalHealing() {
    return this.angerHealing + this.doubtHealing + this.despairHealing;
  }

  get averageHasteIncrease() {
    return (
      (this.selectedCombatant.getBuffUptime(SPELLS.LESSON_OF_FEAR_BUFF.id) /
        this.owner.fightDuration) *
      FEAR_HASTE_INCREASE
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS_MONK.SHAOHAOS_LESSONS_TALENT.id} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(4)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <ul>
              <li>
                Note: Lesson of Fear's (haste) increase is not included in HPS as a haste buff
                cannot be directly attributed to a healing increase
              </li>
            </ul>
            Healing:
            <ul>
              <li>Anger: {formatNumber(this.angerHealing)}</li>
              <li>Despair: {formatNumber(this.despairHealing)}</li>
              <li>Doubt: {formatNumber(this.doubtHealing)}</li>
            </ul>
            Damage:
            <ul>
              <li>Anger: {formatNumber(this.angerDamage)}</li>
              <li>Despair: {formatNumber(this.despairDamage)}</li>
              <li>Doubt: {formatNumber(this.doubtDamage)}</li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.SHAOHAOS_LESSONS_TALENT}>
          <ItemHealingDone amount={this.totalHealing} /> <br />
          <ItemDamageDone amount={this.totalDamage} /> <br />
          <img alt="Damage Mitigated" src="/img/shield.png" className="icon" />{' '}
          {formatNumber(this.fearMitigated)} <small> damage mitigated</small>
          <br />
          <img alt="" src="/img/wheelchair.png" className="icon" />{' '}
          {formatPercentage(this.averageHasteIncrease, 1)}% <small>average haste increase</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ShaohaosLessons;

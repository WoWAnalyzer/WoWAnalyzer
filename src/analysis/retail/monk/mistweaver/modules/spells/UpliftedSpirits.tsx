import { formatDuration, formatNumber } from 'common/format';
import { TALENTS_MONK } from 'common/TALENTS';
import { Talent } from 'common/TALENTS/types';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import Revival from './Revival';
import { UPLIFTED_SPIRITS_COOLDOWN_REDUCTION, UPLIFTED_SPIRITS_INCREASE } from '../../constants';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';

const BASE_COOLDOWN = 180000; // 3 minutes in ms
/**
 * Revival Cooldown is reduced by 30s and revival's healing is increased by 15%
 **/
class UpliftedSpirits extends Analyzer {
  static dependencies = {
    revival: Revival,
  };
  cooldownReductionUsed = 0;
  cooldownReductionWasted = 0;
  lastCastTimestamp = 0;
  usHealing = 0;
  activeTalent!: Talent;
  totalCasts = 0;
  protected revival!: Revival;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.UPLIFTED_SPIRITS_TALENT);
    if (!this.active) {
      return;
    }
    this.activeTalent = this.selectedCombatant.hasTalent(TALENTS_MONK.REVIVAL_TALENT)
      ? TALENTS_MONK.REVIVAL_TALENT
      : TALENTS_MONK.RESTORAL_TALENT;
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(this.activeTalent), this.onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.activeTalent), this.onCast);
  }

  onCast(event: CastEvent) {
    if (this.lastCastTimestamp !== 0) {
      const timeSinceLastCast = event.timestamp - this.lastCastTimestamp;
      if (timeSinceLastCast <= BASE_COOLDOWN) {
        this.cooldownReductionUsed += BASE_COOLDOWN - timeSinceLastCast;
        this.cooldownReductionWasted +=
          timeSinceLastCast - (BASE_COOLDOWN - UPLIFTED_SPIRITS_COOLDOWN_REDUCTION);
      } else {
        this.cooldownReductionWasted += UPLIFTED_SPIRITS_COOLDOWN_REDUCTION;
      }
    }
    this.lastCastTimestamp = event.timestamp;
  }
  onHeal(event: HealEvent) {
    this.totalCasts += 1;
    this.usHealing += calculateEffectiveHealing(event, UPLIFTED_SPIRITS_INCREASE);
  }

  get effectiveHealingIncrease() {
    const increase = BASE_COOLDOWN / (BASE_COOLDOWN - this.averageCdr);
    if (increase <= 1) {
      return 0;
    }
    return this.revival.revivalDirectHealing / increase;
  }

  get averageCdr() {
    // didnt use any cdr
    if (this.totalCasts <= 1) {
      return 0;
    }
    return this.cooldownReductionUsed / this.totalCasts - 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(15)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Effective Healing From Additional <SpellLink spell={this.activeTalent} /> Casts:{' '}
            {formatNumber(this.effectiveHealingIncrease)}
            <br />
            Healing from <SpellLink spell={TALENTS_MONK.UPLIFTED_SPIRITS_TALENT} /> Increase:{' '}
            {formatNumber(this.usHealing)}
            <br />
            Effective Cooldown Reduction: {formatNumber(this.cooldownReductionUsed / 1000)} Seconds
            <br />
            Wasted Cooldown Reduction: {formatNumber(this.cooldownReductionWasted / 1000)} Seconds
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_MONK.UPLIFTED_SPIRITS_TALENT}>
          <ItemHealingDone amount={this.usHealing + this.effectiveHealingIncrease} />
          <div>
            {formatDuration(BASE_COOLDOWN - this.averageCdr)}{' '}
            <small>
              average <SpellLink spell={this.activeTalent} /> cooldown
            </small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default UpliftedSpirits;

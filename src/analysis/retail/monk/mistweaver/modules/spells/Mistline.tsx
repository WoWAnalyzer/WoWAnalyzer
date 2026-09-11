import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { formatPercentage } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { EventType, HealEvent } from 'parser/core/Events';
import CritEffectBonus from 'parser/shared/modules/helpers/CritEffectBonus';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { MISTLINE_INCREASE } from '../../constants';

const MISTLINE_OUTLIER_MULTIPLIER = 3;

/**
 * mistline forces a single renewing mist to heal for 500% more
 * on whichever ally has the lowest hp % in the group. this is costly,
 * therefore difficult to track and eventListeners don't take in all
 * damage taken or dealt to other players, so we have to interpolate
 * which ticks were boosted by getting a median of all ticks and flagging any that are significantly larger than that as "boosted".
 */
class Mistline extends Analyzer {
  static dependencies = {
    critEffectBonus: CritEffectBonus,
  };
  protected critEffectBonus!: CritEffectBonus;

  healing = 0;
  boostedHits = 0;
  totalHits = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MISTLINE_TALENT);

    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private getRemHeals(): HealEvent[] {
    return this.owner.eventHistory.filter(
      (event): event is HealEvent =>
        event.type === EventType.Heal &&
        event.ability.guid === SPELLS.RENEWING_MIST_HEAL.id &&
        this.owner.byPlayer(event),
    );
  }

  private normalizedMagnitude(event: HealEvent): number {
    const raw = event.amount + (event.absorbed || 0) + (event.overheal || 0);
    return event.hitType === HIT_TYPES.CRIT ? raw / this.critEffectBonus.getBonus(event) : raw;
  }

  private static median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  private onFightEnd() {
    this.healing = 0;
    this.boostedHits = 0;

    const remHeals = this.getRemHeals();
    this.totalHits = remHeals.length;
    if (remHeals.length === 0) return;

    const magnitudes = remHeals.map((event) => this.normalizedMagnitude(event));
    const typicalMagnitude = Mistline.median(magnitudes);
    if (typicalMagnitude <= 0) return;

    remHeals.forEach((event, i) => {
      if (magnitudes[i] >= typicalMagnitude * MISTLINE_OUTLIER_MULTIPLIER) {
        this.healing += calculateEffectiveHealing(event, MISTLINE_INCREASE);
        this.boostedHits += 1;
      }
    });
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.MISTLINE_TALENT} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <div>
            <SpellLink spell={SPELLS.RENEWING_MIST_HEAL} /> ticks identified as boosted:{' '}
            {this.boostedHits} / {this.totalHits}
          </div>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.MISTLINE_TALENT}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Mistline;

import SPELLS from 'common/SPELLS';
import TALENTS_SHAMAN from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import { formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import SpellLink from 'interface/SpellLink';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

/**
 * **Tidewaters talent (retrofitted from T30 tier set)**
 * When you cast Healing Rain, each ally with your Riptide on them is healed for (180% of Spell power).
 */

export default class Tidewaters extends Analyzer {
  tidewatersHealing: number = 0;
  tidewatersOverheal: number = 0;
  healingRainCasts: number = 0;
  tidewatersHealingEvents: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.TIDEWATERS_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.TIDEWATERS_HEAL),
      this.onTidewatersHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.HEALING_RAIN_TALENT),
      this.onHealingRainCast,
    );
  }

  get tidewatersOverhealPercent() {
    return formatPercentage(
      this.tidewatersOverheal / (this.tidewatersHealing + this.tidewatersOverheal),
    );
  }

  onTidewatersHeal(event: HealEvent) {
    this.tidewatersHealingEvents += 1;
    this.tidewatersHealing += event.amount + (event.absorbed || 0);
    this.tidewatersOverheal += event.overheal || 0;
  }

  onHealingRainCast(event: CastEvent) {
    this.healingRainCasts += 1;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <ul>
              <li>
                You cast {this.healingRainCasts}{' '}
                <SpellLink spell={TALENTS_SHAMAN.HEALING_RAIN_TALENT} /> over the course of the
                fight, that healed {this.tidewatersHealingEvents} targets under{' '}
                <SpellLink spell={TALENTS_SHAMAN.RIPTIDE_TALENT} />.
              </li>
              <li>This talent overhealed for {this.tidewatersOverhealPercent} %</li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_SHAMAN.TIDEWATERS_TALENT}>
          <div>
            <ItemHealingDone amount={this.tidewatersHealing} />{' '}
          </div>
          <div>
            {this.healingRainCasts > 0 && (
              <>
                {(this.tidewatersHealingEvents / this.healingRainCasts).toFixed(2)}{' '}
                <small>average targets</small>
              </>
            )}
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_SHAMAN.TIDEWATERS_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.tidewatersHealing),
        )} %`}
      />
    );
  }
}

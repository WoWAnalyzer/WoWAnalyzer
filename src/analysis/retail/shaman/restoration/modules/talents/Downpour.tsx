import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber, formatPercentage } from 'common/format';
import HealingRain from '../spells/HealingRain';
import SPELLS from 'common/SPELLS';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import SpellLink from 'interface/SpellLink';
import SurgingTotem from './totemic/SurgingTotem';

class Downpour extends Analyzer {
  static dependencies = {
    healingRain: HealingRain,
    surgingTotem: SurgingTotem,
  };

  protected healingRain!: HealingRain;
  protected surgingTotem!: SurgingTotem;

  downpourCasts = 0;
  downpourHits = 0;
  downpourHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DOWNPOUR_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DOWNPOUR_ABILITY),
      this._onDownpourCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DOWNPOUR_HEAL),
      this._ondownpourHealing,
    );
  }

  _onDownpourCast() {
    this.downpourCasts += 1;
  }

  _ondownpourHealing(event: HealEvent) {
    this.downpourHits += 1;
    this.downpourHealing += event.amount;
  }

  get availableDownpourCasts() {
    const availableCasts = this.healingRain.casts + this.surgingTotem.casts;
    return this.selectedCombatant.hasTalent(TALENTS.DOUBLE_DIP_TALENT)
      ? availableCasts * 2
      : availableCasts;
  }

  get wastedDownpourCasts() {
    return this.availableDownpourCasts - this.downpourCasts;
  }

  get wastedDownpourCastsPercent() {
    return 1 - this.downpourCasts / this.availableDownpourCasts;
  }

  get averageTargetsHit() {
    return this.downpourCasts !== 0 ? this.downpourHits / this.downpourCasts : 0;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <TalentSpellText talent={TALENTS.DOWNPOUR_TALENT}>
          <div>
            <ItemHealingDone amount={this.downpourHealing} />
          </div>
          <div>
            {formatNumber(this.wastedDownpourCasts)}{' '}
            <small>wasted procs ({formatPercentage(this.wastedDownpourCastsPercent)}%)</small>
          </div>
          <div>
            {formatNumber(this.averageTargetsHit)} <small>average targets</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS.DOWNPOUR_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.downpourHealing),
        )} %`}
      />
    );
  }
}

export default Downpour;

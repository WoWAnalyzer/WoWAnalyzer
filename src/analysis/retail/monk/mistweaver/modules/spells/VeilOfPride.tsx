import { formatNumber, formatPercentage } from 'common/format';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SheilunsGift from './SheilunsGift';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';

const MAX_STACKS = 10;

class VeilOfPride extends Analyzer {
  static dependencies = {
    sheilunsGift: SheilunsGift,
  };
  protected sheilunsGift!: SheilunsGift;
  totalExtraClouds: number = 0;
  totalCasts: number = 0;
  totalHealing: number = 0;
  totalOverhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.VEIL_OF_PRIDE_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.SHEILUNS_GIFT_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.SHEILUNS_GIFT_TALENT),
      this.onHeal,
    );
  }

  onCast(event: CastEvent) {
    this.totalCasts += 1;
  }

  onHeal(event: HealEvent) {
    // double clouds = 100% increase -> 2x / x - 1 = 1
    const veilStacksLost = Math.ceil(this.sheilunsGift.cloudsLostSinceLastCast / 2);
    const extraStacks = Math.max(0, Math.ceil(this.sheilunsGift.curClouds / 2) + veilStacksLost);
    const increase = this.sheilunsGift.curClouds / (MAX_STACKS - extraStacks);
    this.totalHealing += calculateEffectiveHealing(event, increase);
    this.totalOverhealing += calculateOverhealing(event, increase);
    this.totalExtraClouds += extraStacks;
  }

  get avgExtraClouds() {
    return this.totalExtraClouds / this.totalCasts;
  }

  get percentOfSgOverhealing() {
    return this.totalOverhealing / this.sheilunsGift.overhealing;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS_MONK.VEIL_OF_PRIDE_TALENT.id} />}
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
              <li>Total Healing : {formatNumber(this.totalHealing)}</li>
              <li>Total overhealing: {formatNumber(this.totalOverhealing)}</li>
              <li>
                Percent of <SpellLink id={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> overhealing:{' '}
                {formatPercentage(this.percentOfSgOverhealing)}%
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.VEIL_OF_PRIDE_TALENT}>
          <ItemHealingDone amount={this.totalHealing} /> <br />
          {(this.sheilunsGift.averageClouds / 2).toFixed(1)} <small>extra clouds</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default VeilOfPride;

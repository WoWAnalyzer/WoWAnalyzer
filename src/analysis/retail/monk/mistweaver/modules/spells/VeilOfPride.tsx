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

const SECONDS_PER_CLOUD = 8000;
const MAX_STACKS = 10;
const VEIL_SECONDS_PER_CLOUD = 4000;

class VeilOfPride extends Analyzer {
  static dependencies = {
    sheilunsGift: SheilunsGift,
  };
  protected sheilunsGift!: SheilunsGift;
  lastCast: number = 0;
  stacksOnCast: number = 0;
  totalExtraClouds: number = 0;
  totalCasts: number = 0;
  totalHealing: number = 0;
  totalOverhealing: number = 0;
  extraStacksOnCast: number = 0;

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
    this.stacksOnCast = this.sheilunsGift.curClouds;
    this.extraStacksOnCast = this.getExtraClouds(event.timestamp);
    this.lastCast = event.timestamp;
    this.totalCasts += 1;
  }

  getExtraStacks(baseStacks: number, totalStacks: number) {
    if (totalStacks < MAX_STACKS) {
      return totalStacks - baseStacks;
    } else if (totalStacks < MAX_STACKS * 2) {
      return Math.max(0, MAX_STACKS - baseStacks);
    }
    return 0;
  }

  getExtraClouds(timestamp: number) {
    if (this.lastCast === 0) {
      this.lastCast = this.owner.fight.start_time;
    }
    const timeDiff = timestamp - this.lastCast;
    const nonVeilStacks = Math.floor(timeDiff / SECONDS_PER_CLOUD);
    const rawVeilStacks = Math.floor(timeDiff / VEIL_SECONDS_PER_CLOUD);
    return this.getExtraStacks(nonVeilStacks, rawVeilStacks);
  }

  onHeal(event: HealEvent) {
    // double clouds = 100% increase -> 2x / x - 1 = 1
    const baseStacks = this.stacksOnCast - this.extraStacksOnCast;
    const effectiveIncrease = this.stacksOnCast / baseStacks - 1;
    this.totalHealing += calculateEffectiveHealing(event, effectiveIncrease);
    this.totalOverhealing += calculateOverhealing(event, effectiveIncrease);
    this.totalExtraClouds += this.stacksOnCast - this.extraStacksOnCast;
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

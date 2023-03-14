import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { isFromSheilunsGift } from '../../normalizers/CastLinkNormalizer';

class SheilunsGift extends Analyzer {
  numCasts: number = 0;
  totalStacks: number = 0;
  baseHealing: number = 0;
  gomHealing: number = 0;
  cloudsLost: number = 0;
  curClouds: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.SHEILUNS_GIFT_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.SHEILUNS_GIFT_TALENT),
      this.onHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.masterySheilunsGift,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SHEILUN_CLOUD_BUFF),
      this.onBuffRefresh,
    );
  }

  onCast(event: CastEvent) {
    this.totalStacks += this.selectedCombatant.getBuffStacks(SPELLS.SHEILUN_CLOUD_BUFF.id);
    this.numCasts += 1;
  }

  onHeal(event: HealEvent) {
    this.baseHealing += event.amount;
  }

  onBuffRefresh(event: RefreshBuffEvent) {
    if (this.curClouds === 10) {
      this.cloudsLost += 1;
    }
    this.curClouds = this.selectedCombatant.getBuffStacks(SPELLS.SHEILUN_CLOUD_BUFF.id);
  }

  masterySheilunsGift(event: HealEvent) {
    if (isFromSheilunsGift(event)) {
      this.gomHealing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  get averageClouds() {
    return this.totalStacks / this.numCasts;
  }

  get totalHealing() {
    return this.baseHealing + this.gomHealing;
  }

  get suggestionThresholds() {
    return {
      actual: this.cloudsLost,
      isGreaterThan: {
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to not overcap on <SpellLink id={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> clouds
        </>,
      )
        .icon(TALENTS_MONK.SHEILUNS_GIFT_TALENT.icon)
        .actual(`${this.cloudsLost} lost cloud${this.cloudsLost > 1 ? 's' : ''} from overcapping`)
        .recommended(`0 lost clouds is recommended`),
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS_MONK.SHEILUNS_GIFT_TALENT.id} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.SHEILUNS_GIFT_TALENT}>
          <ItemHealingDone amount={this.totalHealing} /> <br />
          {this.averageClouds.toFixed(1)} <small>average clouds</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SheilunsGift;

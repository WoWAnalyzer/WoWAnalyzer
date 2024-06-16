import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { getSheilunsGiftHits, isFromSheilunsGift } from '../../normalizers/CastLinkNormalizer';
import { SHEILUNS_GIFT_TARGETS } from '../../constants';

class SheilunsGift extends Analyzer {
  numCasts: number = 0;
  totalStacks: number = 0;
  baseHealing: number = 0;
  gomHealing: number = 0;
  cloudsLost: number = 0;
  cloudsLostSinceLastCast: number = 0;
  curClouds: number = 0;
  overhealing: number = 0;
  legacyOfWisdomActive: boolean = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT);
    if (!this.active) {
      return;
    }
    this.legacyOfWisdomActive = this.selectedCombatant.hasTalent(
      TALENTS_MONK.LEGACY_OF_WISDOM_TALENT,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.SHEILUNS_GIFT_TALENT),
      this.onCast,
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
    this.cloudsLostSinceLastCast = 0;
    this.numCasts += 1;

    const sgHealEvents = getSheilunsGiftHits(event);
    if (!sgHealEvents) {
      return;
    }
    const baseHits = sgHealEvents.splice(0, SHEILUNS_GIFT_TARGETS);
    if (!baseHits) {
      return;
    }
    this.baseHealing += baseHits.reduce((sum, heal) => sum + heal.amount + (heal.absorbed || 0), 0);
    this.overhealing += baseHits.reduce((sum, heal) => sum + (heal.overheal || 0), 0);
  }

  onBuffRefresh(event: RefreshBuffEvent) {
    if (this.curClouds === 10) {
      this.cloudsLost += 1;
      this.cloudsLostSinceLastCast += 1;
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

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.SHEILUNS_GIFT_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(9)}
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

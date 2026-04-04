import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  getSheilunsGiftHits,
  getSheilunsGiftMainTargetHit,
  isFromSheilunsGift,
} from '../../normalizers/CastLinkNormalizer';
import {
  EMPERORS_FAVOR_INCREASE,
  INVIGORATING_MISTS_INCREASE,
  SHEILUNS_GIFT_TARGETS,
} from '../../constants';
import { effectiveHealing } from 'parser/shared/modules/HealingValue';

// normalize sheilun's gift heal events to remove invigorating mist increase
export function getNormalizedSheilunsGiftHits(event: CastEvent): HealEvent[] {
  const sgHealEvents = getSheilunsGiftHits(event);
  if (!sgHealEvents || sgHealEvents.length === 0) return sgHealEvents;

  const mainTarget = getSheilunsGiftMainTargetHit(event);
  if (!mainTarget) return sgHealEvents;

  const multiplier = 1 + INVIGORATING_MISTS_INCREASE;

  return sgHealEvents.map((heal) =>
    heal === mainTarget
      ? {
          ...heal,
          amount: heal.amount / multiplier,
          absorbed: (heal.absorbed || 0) / multiplier,
          overheal: (heal.overheal || 0) / multiplier,
        }
      : heal,
  );
}

class SheilunsGift extends Analyzer {
  numCasts = 0;
  totalStacks = 0;
  baseHealing = 0;
  gomHealing = 0;
  cloudsLost = 0;
  cloudsLostSinceLastCast = 0;
  curClouds = 0;
  overhealing = 0;
  legacyOfWisdomActive = false;
  emperorsFavorActive = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT);
    if (!this.active) {
      return;
    }
    this.legacyOfWisdomActive = this.selectedCombatant.hasTalent(
      TALENTS_MONK.LEGACY_OF_WISDOM_TALENT,
    );
    this.emperorsFavorActive = this.selectedCombatant.hasTalent(TALENTS_MONK.EMPERORS_FAVOR_TALENT);
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

  calcEmperorsFavor(healEvents: HealEvent[]) {
    const hit = healEvents[0];

    const effectiveHealingIncrease = calculateEffectiveHealing(hit, EMPERORS_FAVOR_INCREASE);
    const effectiveOverhealingIncrease = calculateOverhealing(hit, EMPERORS_FAVOR_INCREASE);

    this.baseHealing += effectiveHealing(hit) - effectiveHealingIncrease;
    this.overhealing += (hit.overheal || 0) - effectiveOverhealingIncrease;
  }

  calcRegularSG(healEvents: HealEvent[]) {
    const baseHits = healEvents.slice(0, SHEILUNS_GIFT_TARGETS);
    if (baseHits.length === 0) return;

    this.baseHealing += baseHits.reduce((sum, heal) => sum + effectiveHealing(heal), 0);
    this.overhealing += baseHits.reduce((sum, heal) => sum + (heal.overheal || 0), 0);
  }

  onCast(event: CastEvent) {
    this.totalStacks += this.selectedCombatant.getBuffStacks(SPELLS.SHEILUN_CLOUD_BUFF.id);
    this.cloudsLostSinceLastCast = 0;
    this.numCasts += 1;

    const normalizedSGHealEvents = getNormalizedSheilunsGiftHits(event);
    if (!normalizedSGHealEvents || normalizedSGHealEvents.length === 0) return;

    if (this.emperorsFavorActive) {
      this.calcEmperorsFavor(normalizedSGHealEvents);
    } else {
      this.calcRegularSG(normalizedSGHealEvents);
    }
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
      this.gomHealing += effectiveHealing(event);
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
          <div>
            <ItemHealingDone amount={this.totalHealing} />
          </div>
          <div>
            {this.averageClouds.toFixed(1)} <small>average clouds</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SheilunsGift;

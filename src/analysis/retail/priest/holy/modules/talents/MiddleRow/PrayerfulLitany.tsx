import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TalentSpellText from 'parser/ui/TalentSpellText';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { getPrayerOfHealingEvents } from '../../../normalizers/CastLinkNormalizer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber, formatPercentage } from 'common/format';

const PRAYERFUL_LITANY_MULTIPLIER = 1;

/*
  Prayer of Healing heals for 30% more to the most injured ally it affects.
*/
class PrayerfulLitany extends Analyzer {
  effectiveAdditionalHealing: number = 0;
  overhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PRAYERFUL_LITANY_TALENT);
    if (this.active) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PRAYER_OF_HEALING_TALENT),
        this.onPohCast,
      );
    }
  }

  onPohCast(event: CastEvent) {
    const healEvents: HealEvent[] = getPrayerOfHealingEvents(event);
    let buffedHealEvent: HealEvent | undefined;
    let lowestHealth = Infinity;

    // find the heal buffed by litany
    for (const healEvent of healEvents) {
      // litany buffs heal on lowest health player
      const healthBeforeHeal = healEvent.hitPoints - healEvent.amount;
      if (healthBeforeHeal < lowestHealth) {
        lowestHealth = healthBeforeHeal;
        buffedHealEvent = healEvent;
      }
    }

    if (buffedHealEvent !== undefined) {
      const effectiveHealAmount = calculateEffectiveHealing(
        buffedHealEvent,
        PRAYERFUL_LITANY_MULTIPLIER,
      );
      const overHealAmount = calculateOverhealing(buffedHealEvent, PRAYERFUL_LITANY_MULTIPLIER);

      this.effectiveAdditionalHealing += effectiveHealAmount;
      this.overhealing += overHealAmount;
    }
  }

  get percentOverhealing() {
    const rawHealing = this.effectiveAdditionalHealing + this.overhealing;
    if (rawHealing === 0) {
      return 0;
    }
    return this.overhealing / rawHealing;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(6)}
        tooltip={
          <>
            Total Healing: {formatNumber(this.effectiveAdditionalHealing + this.overhealing)} (
            {formatPercentage(this.percentOverhealing)}% OH)
          </>
        }
      >
        <TalentSpellText talent={TALENTS.PRAYERFUL_LITANY_TALENT}>
          <ItemHealingDone amount={this.effectiveAdditionalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PrayerfulLitany;

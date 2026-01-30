import { formatPercentage, formatNumber } from 'common/format';
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
import { getSheilunsGiftMainTargetHit } from '../../normalizers/CastLinkNormalizer';
import { INVIGORATING_MISTS_INCREASE } from '../../constants';
import { effectiveHealing } from 'parser/shared/modules/HealingValue';

class InvigoratingMists extends Analyzer {
  healing = 0;
  overhealing = 0;
  hasSheilunsGift = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.INVIGORATING_MISTS_TALENT);

    this.hasSheilunsGift = this.selectedCombatant.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT);

    if (this.hasSheilunsGift) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.SHEILUNS_GIFT_TALENT),
        this.onSheilunsGiftCast,
      );
    } else {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.INVIGORATING_MISTS_HEAL),
        this.onInvigHeal,
      );
    }
  }

  onSheilunsGiftCast(event: CastEvent) {
    const mainTargetHit = getSheilunsGiftMainTargetHit(event);
    if (!mainTargetHit) return;

    this.healing += calculateEffectiveHealing(mainTargetHit, INVIGORATING_MISTS_INCREASE);
    this.overhealing += calculateOverhealing(mainTargetHit, INVIGORATING_MISTS_INCREASE);
  }

  onInvigHeal(event: HealEvent) {
    this.healing += effectiveHealing(event);
    this.overhealing += event.overheal || 0;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={SPELLS.INVIGORATING_MISTS_HEAL} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Effective{' '}
            {this.hasSheilunsGift ? (
              <SpellLink spell={TALENTS_MONK.SHEILUNS_GIFT_TALENT} />
            ) : (
              <SpellLink spell={SPELLS.INVIGORATING_MISTS_HEAL} />
            )}{' '}
            healing: {formatNumber(this.healing)}
            <br />
            Overhealing: {formatNumber(this.overhealing)} (
            {formatPercentage(this.overhealing / (this.healing + this.overhealing))}%)
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.INVIGORATING_MISTS_TALENT}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default InvigoratingMists;

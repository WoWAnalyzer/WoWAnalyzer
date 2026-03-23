import { TALENTS_MONK } from 'common/TALENTS/monk';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvents, HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { formatPercentage, formatNumber } from 'common/format';
import { SpellLink } from 'interface';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import StatTracker from 'parser/shared/modules/StatTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { AT_RSK } from '../../normalizers/EventLinks/EventLinkConstants';
import {
  getCurrentRSKTalent,
  getCurrentRSKTalentDamage,
  MORNING_BREEZE_INCREASE,
} from '../../constants';
import { Talent } from 'common/TALENTS/types';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

class MorningBreeze extends Analyzer.withDependencies({
  statTracker: StatTracker,
  spellUsable: SpellUsable,
}) {
  healing = 0;
  damage = 0;
  wastedResets = 0;
  effectiveRSKCdr = 0;
  currentRskTalent: Talent;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MORNING_BREEZE_TALENT);
    this.currentRskTalent = getCurrentRSKTalent(this.selectedCombatant);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT),
      this.onTFT,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(getCurrentRSKTalentDamage(this.selectedCombatant)),
      this.onRSK,
    );
  }

  onTFT(event: CastEvent) {
    if (this.deps.spellUsable.isOnCooldown(this.currentRskTalent.id)) {
      const remainingCooldown = this.deps.spellUsable.cooldownRemaining(this.currentRskTalent.id);
      this.effectiveRSKCdr += remainingCooldown;

      this.deps.spellUsable.endCooldown(this.currentRskTalent.id);
    } else {
      this.wastedResets += 1;

      addInefficientCastReason(
        event,
        <>
          You cast <SpellLink spell={event.ability.guid} /> while{' '}
          <SpellLink spell={this.currentRskTalent} /> was available, losing cooldown reduction from{' '}
          <SpellLink spell={TALENTS_MONK.MORNING_BREEZE_TALENT} />.
        </>,
      );
    }
  }

  onRSK(event: DamageEvent) {
    const multiplier = this.deps.statTracker.currentMasteryPercentage * MORNING_BREEZE_INCREASE;

    this.damage += calculateEffectiveDamage(event, multiplier);
    this.healing += GetRelatedEvents<HealEvent>(event, AT_RSK).reduce(
      (total, ATEvent) => total + calculateEffectiveHealing(ATEvent, multiplier),
      0,
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.MORNING_BREEZE_TALENT} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(30)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <div>
              Effective <SpellLink spell={this.currentRskTalent} /> Damage:{' '}
              {formatNumber(this.damage)}
            </div>
            <div>
              <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> cast with{' '}
              <SpellLink spell={this.currentRskTalent} /> available: {this.wastedResets}
            </div>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.MORNING_BREEZE_TALENT}>
          <div>
            <ItemHealingDone amount={this.healing} />
          </div>
          <div>
            <ItemCooldownReduction effective={this.effectiveRSKCdr} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MorningBreeze;

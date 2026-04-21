import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import Events, { HealEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber } from 'common/format';

const COALESCING_WATER_HEALING_INCREASE = 0.3;

export default class CoalescingWater extends Analyzer {
  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.COALESCING_WATER_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this.onRiptideHeal,
    );
  }

  onRiptideHeal(event: HealEvent) {
    // ignore HoT aspect of riptide
    if (event.tick) {
      return;
    }
    // ignore unbuffed riptide casts
    if (!this.selectedCombatant.hasBuff(SPELLS.COALESCING_WATER_BUFF)) {
      return;
    }

    const coalescingWaterStacks =
      this.selectedCombatant.getBuff(SPELLS.COALESCING_WATER_BUFF)?.stacks ?? 0;
    const talentBuff = coalescingWaterStacks * COALESCING_WATER_HEALING_INCREASE;
    this.healingDoneFromTalent += calculateEffectiveHealing(event, talentBuff);

    this.overhealingDoneFromTalent += calculateOverhealing(event, talentBuff);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <strong>{formatNumber(this.healingDoneFromTalent)}</strong> bonus healing (
            {formatNumber(this.overhealingDoneFromTalent)} overhealing)
          </>
        }
      >
        <TalentSpellText talent={TALENTS.COALESCING_WATER_TALENT}>
          <div>
            <ItemHealingDone amount={this.healingDoneFromTalent} />{' '}
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

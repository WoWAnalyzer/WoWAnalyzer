import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import Events, { HealEvent, CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemManaGained from 'parser/ui/ItemManaGained';
import { isLivelyTotemsChainHealCast } from '../../normalizers/CastLinkNormalizer';
import { formatNumber } from 'common/format';

// 10% mana cost reduction on chain heal
const COALESCING_WATER_MANA_COST_REDUCTION = 0.1;
const COALESCING_WATER_HEALING_INCREASE = 0.75;

export default class CoalescingWater extends Analyzer {
  manaSavedFromTalent = 0;
  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;
  chainHealCasts = 0;

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
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_HEAL_TALENT),
      this.onChainHealCast,
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

    const talentBuff =
      this.selectedCombatant.getBuff(SPELLS.COALESCING_WATER_BUFF)?.stacks ??
      0 * COALESCING_WATER_HEALING_INCREASE;
    this.healingDoneFromTalent += calculateEffectiveHealing(event, talentBuff);

    this.overhealingDoneFromTalent += calculateOverhealing(event, talentBuff);
  }

  onChainHealCast(event: CastEvent) {
    if (isLivelyTotemsChainHealCast(event)) {
      return;
    }
    this.chainHealCasts += 1;
    if (event.resourceCost) {
      this.manaSavedFromTalent += event.resourceCost[0] * COALESCING_WATER_MANA_COST_REDUCTION;
    }
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
            <br />
            {this.chainHealCasts} Hard Casted chain heals, saving{' '}
            {formatNumber(this.manaSavedFromTalent)} mana.
          </>
        }
      >
        <TalentSpellText talent={TALENTS.COALESCING_WATER_TALENT}>
          <div>
            <ItemHealingDone amount={this.healingDoneFromTalent} />{' '}
          </div>
          <div>
            <ItemManaGained amount={this.manaSavedFromTalent} useAbbrev />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

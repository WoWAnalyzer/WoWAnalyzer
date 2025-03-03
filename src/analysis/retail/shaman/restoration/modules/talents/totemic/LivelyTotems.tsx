import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import Events, { HealEvent, CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemManaGained from 'parser/ui/ItemManaGained';
import {
  isLivelyTotemsChainHeal,
  isLivelyTotemsChainHealCast,
} from '../../../normalizers/CastLinkNormalizer';
import { formatNumber } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

export default class LivelyTotems extends Analyzer {
  manaSavedFromTalent = 0;
  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;
  chainHealCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.LIVELY_TOTEMS_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_HEAL_TALENT),
      this.onChainHealCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_HEAL_TALENT),
      this.onChainHeal,
    );
  }

  onChainHealCast(event: CastEvent) {
    if (!isLivelyTotemsChainHealCast(event)) {
      return;
    }
    this.chainHealCasts += 1;

    if (event.resourceCost) {
      const baseCost = event.resourceCost[RESOURCE_TYPES.MANA.id];
      if (this.selectedCombatant.hasTalent(TALENTS.COALESCING_WATER_TALENT)) {
        // Coalescing Water reduces the mana cost of Chain Heal by 10%
        this.manaSavedFromTalent += baseCost - baseCost * 0.1;
      } else {
        this.manaSavedFromTalent += baseCost;
      }
    }
  }

  onChainHeal(event: HealEvent) {
    if (!isLivelyTotemsChainHeal(event)) {
      return;
    }
    this.healingDoneFromTalent += event.amount;
    this.overhealingDoneFromTalent += event.overheal ?? 0;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <strong>{formatNumber(this.healingDoneFromTalent)}</strong> bonus healing (
            {formatNumber(this.overhealingDoneFromTalent)} overhealing)
            <br />
            {this.chainHealCasts} free chain heals, saving {formatNumber(this.manaSavedFromTalent)}{' '}
            mana.
          </>
        }
      >
        <TalentSpellText talent={TALENTS.LIVELY_TOTEMS_TALENT}>
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

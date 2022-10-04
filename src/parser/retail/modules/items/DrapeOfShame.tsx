import { formatNumber } from 'common/format';
import ITEMS from 'common/ITEMS';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { Options, SELECTED_PLAYER, InjectedDependencies } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import CritEffectBonus, { ValidEvents } from 'parser/shared/modules/helpers/CritEffectBonus';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

export const DRAPE_OF_SHAME_CRIT_EFFECT = 0.03;

export class DrapeOfShame extends Analyzer {
  static dependencies = {
    critEffectBonus: CritEffectBonus,
    abilities: Abilities,
  };

  protected critEffectBonus!: CritEffectBonus;
  protected abilities!: Abilities;

  effectiveHealing = 0;
  overhealing = 0;

  constructor(options: Options & InjectedDependencies<typeof DrapeOfShame.dependencies>) {
    super(options);
    if (this.selectedCombatant.getItem(ITEMS.DRAPE_OF_SHAME.id) == null) {
      this.active = false;
      return;
    }

    options.critEffectBonus.hook(this.getCritEffectBonus);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  getCritEffectBonus = (critEffectModifier: number, event: ValidEvents): number => {
    if (!this.abilities.getAffectedByHealingIncreases(event.ability.guid)) {
      return critEffectModifier;
    }
    return critEffectModifier + DRAPE_OF_SHAME_CRIT_EFFECT;
  };

  isApplicableHeal = (event: HealEvent) => {
    const spellId = event.ability.guid;
    if (!this.abilities.getAffectedByHealingIncreases(spellId)) {
      return false;
    }

    if (event.hitType !== HIT_TYPES.CRIT) {
      return false;
    }

    return true;
  };

  onHeal = (event: HealEvent) => {
    if (!this.isApplicableHeal(event)) {
      return;
    }

    const contribution = this.critEffectBonus.getHealingContribution(
      event,
      DRAPE_OF_SHAME_CRIT_EFFECT,
    );

    this.effectiveHealing += contribution.effectiveHealing;
    this.overhealing += contribution.overhealing;
  };

  statistic() {
    const tooltip = (
      <>
        <ul>
          <li>Healing: {this.owner.formatItemHealingDone(this.effectiveHealing)}</li>
          <li>Overhealing: {formatNumber(this.owner.getPerSecond(this.overhealing))} HPS</li>
        </ul>
      </>
    );

    return (
      <Statistic tooltip={tooltip} category={STATISTIC_CATEGORY.ITEMS} size="small">
        <BoringItemValueText item={ITEMS.DRAPE_OF_SHAME}>
          <ItemHealingDone amount={this.effectiveHealing} />
        </BoringItemValueText>
      </Statistic>
    );
  }
}

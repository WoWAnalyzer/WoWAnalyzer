import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { calculatePrimaryStat } from 'common/stats';
import { formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import ItemHealingDone from 'interface/ItemHealingDone';
import ItemManaGained from 'interface/ItemManaGained';
import PrimaryStatIcon from 'interface/icons/PrimaryStat';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events, { HealEvent, EnergizeEvent, Item } from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

const HEAL_SPELLS = [
  SPELLS.ABYSSAL_HEALING_POTION,
  SPELLS.COASTAL_HEALING_POTION,
  SPELLS.HEALTHSTONE,
];
const MANA_SPELLS = [
  SPELLS.COASTAL_MANA_POTION,
  SPELLS.COASTAL_REJUVENATION_POTION,
  SPELLS.POTION_OF_REPLENISHMENT,
];
const MULT = 0.4;
/**
 * Alchemist Stone -
 * Equip: When you heal or deal damage you have a chance to increase your Strength, Agility, or Intellect by 1648 for 15 sec.  Your highest stat is always chosen.
 * Equip: Increases the effect that healing and mana potions have on the wearer by 40%.  This effect does not stack.
 */
class AlchemistStone extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  healing = 0;
  manaGained = 0;
  statAmount = 0;
  item: Item | undefined;

  constructor(options: any) {
    super(options);
    this.item = this.selectedCombatant.getItem(ITEMS.PEERLESS_ALCHEMIST_STONE.id) ?? this.selectedCombatant.getItem(ITEMS.AWAKENED_ALCHEMIST_STONE.id) ?? this.selectedCombatant.getItem(ITEMS.UNBOUND_ALCHEMIST_STONE.id);
    this.active = Boolean(this.item);
    if (!this.active) {
      return;
    }
    this.statAmount = calculatePrimaryStat(470, 2752, this.item!.itemLevel);
    options.statTracker.add(SPELLS.ALCHEMISTS_STRENGTH, {
      strength: this.statAmount,
    });
    options.statTracker.add(SPELLS.ALCHEMISTS_AGILITY, {
      agility: this.statAmount,
    });
    options.statTracker.add(SPELLS.ALCHEMISTS_INTELLECT, {
      intellect: this.statAmount,
    });

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(HEAL_SPELLS), this.heal);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(MANA_SPELLS), this.mana);
  }

  heal(event: HealEvent) {
    this.healing += calculateEffectiveHealing(event, MULT);
  }

  mana(event: EnergizeEvent) {
    this.manaGained += event.resourceChange * MULT;
  }

  get averageMainstat() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.ALCHEMISTS_STRENGTH.id) +
      this.selectedCombatant.getBuffUptime(SPELLS.ALCHEMISTS_AGILITY.id) +
      this.selectedCombatant.getBuffUptime(SPELLS.ALCHEMISTS_INTELLECT.id)
    ) / this.owner.fightDuration * this.statAmount;
  }

  statistic() {
    const primaryStat = this.selectedCombatant.spec.primaryStat;
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringItemValueText item={this.item!}>
          <ItemHealingDone amount={this.healing} /><br />
          {(this.manaGained > 0) && (
            <><ItemManaGained amount={this.manaGained} /><br /></>
          )}
          <PrimaryStatIcon stat={primaryStat} /> {formatNumber(this.averageMainstat)} <small>average {primaryStat} gained</small>
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default AlchemistStone;

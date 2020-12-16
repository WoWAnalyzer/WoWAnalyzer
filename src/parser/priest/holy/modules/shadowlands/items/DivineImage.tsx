import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'interface/ItemHealingDone';
import { formatNumber, formatPercentage } from 'common/format';

const DEBUG = false;

class DivineImage extends Analyzer {
  totalProcs = 0;
  totalHealing = 0;
  totalOverhealing = 0;

  // For debugging spells that we should count.
  healingSpells: { [spellId: number]: string } = {};

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.DIVINE_IMAGE.bonusID);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER_PET), this.onByPlayerPetHeal);
    this.addEventListener(Events.summon.by(SELECTED_PLAYER), this.onByPlayerSummon);
  }

  onByPlayerPetHeal(event: HealEvent) {
    this.totalHealing += (event.amount || 0) + (event.absorb || 0);
    this.totalOverhealing += (event.overheal || 0);

    if (DEBUG) {
      this.healingSpells[event.ability.guid] = event.ability.name;
    }
  }

  onByPlayerSummon() {
    this.totalProcs += 1;
  }

  statistic() {
    DEBUG && console.log(this.healingSpells);

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={(
          <>
            Total Images Summoned: {this.totalProcs}<br />
            Bonus Healing Done: {formatNumber(this.totalHealing)} ({formatPercentage(this.totalOverhealing / (this.totalHealing + this.totalOverhealing))}% OH)
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.DIVINE_IMAGE}>
          <ItemHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DivineImage;

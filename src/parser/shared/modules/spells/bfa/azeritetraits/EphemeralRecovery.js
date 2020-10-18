import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemManaGained from 'interface/ItemManaGained';
import Events from 'parser/core/Events';

/**
 Casting a healing spell restores 12 mana over 8 sec. Stacks up to 2 times.

 Example Log: /report/qyzBLkQaXDJ7xdZN/5-Mythic+Taloc+-+Kill+(4:12)/23-포오서
 */
class EphemeralRecovery extends Analyzer {
  manaGained = 0;
  procs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.EPHEMERAL_RECOVERY.id);
    this.addEventListener(Events.energize.to(SELECTED_PLAYER).spell(SPELLS.EPHEMERAL_RECOVERY_EFFECT), this.onEnergize);
  }

  onEnergize(event) {
    this.procs += 1;
    this.manaGained += event.resourceChange;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.EPHEMERAL_RECOVERY.id}
        value={<ItemManaGained amount={this.manaGained} />}
        tooltip={`Total procs: ${this.procs}`}
      />
    );
  }
}

export default EphemeralRecovery;

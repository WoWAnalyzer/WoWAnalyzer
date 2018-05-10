import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

class T21_2pc extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  resets = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.PROTECTION_WARRIOR_T21_2P_BONUS.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.SHIELD_SLAM.id || !this.combatants.selected.hasBuff(SPELLS.PROTECTION_WARRIOR_T21_2P_WALL_OF_IRON.id)) {
      return;
    }

    this.spellUsable.endCooldown(SPELLS.SHIELD_SLAM.id);
    this.resets += 1;
  }

  item() {
    return {
      id: `spell-${SPELLS.PROTECTION_WARRIOR_T21_2P_WALL_OF_IRON.id}`,
      icon: <SpellIcon id={SPELLS.PROTECTION_WARRIOR_T21_2P_WALL_OF_IRON.id} />,
      title: <SpellLink id={SPELLS.PROTECTION_WARRIOR_T21_2P_WALL_OF_IRON.id} icon={false} />,
      result: (
        <React.Fragment>Reseted the cooldown of <SpellLink id={SPELLS.SHIELD_SLAM.id} /> {this.resets} times.</React.Fragment>
      ),
    };
  }
}

export default T21_2pc;

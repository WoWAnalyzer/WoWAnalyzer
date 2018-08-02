import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';

class Tier20_2pc extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBuff(SPELLS.UNHOLY_DEATH_KNIGHT_T20_2SET_BONUS.id);
  }

  item() {
    // master of ghouls is buff granted by the set bonus
    const uptime = this.selectedCombatant.getBuffUptime(SPELLS.MASTER_OF_GHOULS_BUFF.id) / this.owner.fightDuration;
    return {
      id: `spell-${SPELLS.UNHOLY_DEATH_KNIGHT_T20_2SET_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.UNHOLY_DEATH_KNIGHT_T20_2SET_BONUS.id} />,
      title: <SpellLink id={SPELLS.UNHOLY_DEATH_KNIGHT_T20_2SET_BONUS.id} icon={false} />,
      result: <React.Fragment>{formatPercentage(uptime)} % uptime.</React.Fragment>,
    };
  }
}

export default Tier20_2pc;

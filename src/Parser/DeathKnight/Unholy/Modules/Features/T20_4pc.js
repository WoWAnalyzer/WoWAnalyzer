++import React from 'react';
 + +
 + +import Analyzer from 'Parser/Core/Analyzer';
 + +import Combatants from 'Parser/Core/Modules/Combatants';
 + +
 + +import SPELLS from 'common/SPELLS';
 + +import SpellLink from 'common/SpellLink';
 + +import SpellIcon from 'common/SpellIcon';
 + +import { formatPercentage } from 'common/format';
 + +
 + +class Tier20_4set extends Analyzer {
 + +  static dependencies = {
 + +    combatants: Combatants,
 + +  };
 + +
 + +  on_initialized() {
 + +    this.active = this.combatants.selected.hasBuff(SPELLS.DEATH_KNIGHT_UNHOLY_T20_2P_BONUS.id);
 + +  }
 + +
 + +  item() {
 + +    const uptime = this.combatants.selected.getBuffUptime(SPELLS.DEATH_KNIGHT_UNHOLY_T20_2P_BONUS.id) / this.owner.fightDuration;
 + +    return {
 + +      id: `spell-${SPELLS.DEATH_KNIGHT_UNHOLY_T20_4P_BONUS.id}`,
 + +      icon: <SpellIcon id={SPELLS.DEATH_KNIGHT_UNHOLY_T20_2P_BONUS.id} />,
 + +      title: <SpellLink id={SPELLS.DEATH_KNIGHT_UNHOLY_T20_2P_BONUS.id} />,
 + +      result: <span>{formatPercentage(uptime)} % uptime on <SpellLink id={SPELLS.DEATH_KNIGHT_UNHOLY_T20_2P_BONUS.id}/>.</span>,
 + +    };
 + +  }
 + +}
 + +
 + +export default Tier20_2pc;

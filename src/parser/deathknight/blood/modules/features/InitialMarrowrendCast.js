import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Events from 'parser/core/Events';

class InitialMarrowrendCast extends Analyzer {

  static dependencies = {
    abilities: Abilities,
  };

  firstMRCast = false;
  firstMRCastWithoutDRW = false;

  constructor(options){
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MARROWREND), this.onCast);
  }

  onCast(event) {
    if (this.firstMRCast) {
      return;
    }

    this.firstMRCast = true;
    if (!this.selectedCombatant.hasBuff(SPELLS.DANCING_RUNE_WEAPON_BUFF.id)) {
      this.firstMRCastWithoutDRW = true;
    }
  }

  get initialMRThresholds() {
    return {
      actual: this.firstMRCastWithoutDRW,
      isEqual: true,
      style: 'boolean',
    };
  }

  suggestions(when) {
    when(this.initialMRThresholds).isTrue().addSuggestion((suggest, actual, recommended) => suggest(<>Use your first <SpellLink id={SPELLS.MARROWREND.id} /> together with <SpellLink id={SPELLS.DANCING_RUNE_WEAPON.id} /> to build up stacks of <SpellLink id={SPELLS.BONE_SHIELD.id} /> faster without wasting as much runes. This will also increase your initial threat-genration as your burst DPS will increase significantly. Don't treat <SpellLink id={SPELLS.DANCING_RUNE_WEAPON.id} /> as a defensive CD unless you really need the parry and increased Runic Power generation defensively.</>)
        .icon(SPELLS.DANCING_RUNE_WEAPON.icon));
  }
}

export default InitialMarrowrendCast;

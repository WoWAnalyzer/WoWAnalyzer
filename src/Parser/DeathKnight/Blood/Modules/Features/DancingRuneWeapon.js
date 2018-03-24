import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';

class DancingRuneWeapon extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  firstMRCast = false;
  firstMRCastWithoutDRW = false;

  castsDuringDRW = [];

  on_byPlayer_cast(event) {

    if (this.combatants.selected.hasBuff(SPELLS.DANCING_RUNE_WEAPON_BUFF.id) && event.ability.guid !== SPELLS.MELEE.id) {
      this.castsDuringDRW.push(event.ability.guid);
      console.info("pushed", event.ability);
    }

    if (event.ability.guid !== SPELLS.MARROWREND.id || this.firstMRCast) {
      return;
    }

    this.firstMRCast = true;
    if (!this.combatants.selected.hasBuff(SPELLS.DANCING_RUNE_WEAPON_BUFF.id)) {
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

  getDRWThresholds() {
    
  }

  suggestions(when) {
    when(this.initialMRThresholds).isTrue().addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Use your first <SpellLink id={SPELLS.MARROWREND.id} /> together with <SpellLink id={SPELLS.DANCING_RUNE_WEAPON.id} /> to gain 10 stacks of <SpellLink id={SPELLS.BONE_SHIELD.id} /> instantly without wasting all 6 runes. This will also increase your initial threat-genration as your burst DPS will increase significantly. Don't treat <SpellLink id={SPELLS.DANCING_RUNE_WEAPON.id} /> as a defensive CD unless you really need the parry and increased Runic Power generation defensively.</Wrapper>)
        .icon(SPELLS.DANCING_RUNE_WEAPON.icon);
    });
  }
}

export default DancingRuneWeapon;

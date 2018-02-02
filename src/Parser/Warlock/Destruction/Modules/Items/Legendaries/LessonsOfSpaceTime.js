import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import ItemDamageDone from 'Main/ItemDamageDone';

const LESSONS_OF_SPACETIME_DAMAGE_BONUS = 0.1;

class LessonsOfSpaceTime extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.LESSONS_OF_SPACETIME.id);
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.LESSONS_OF_SPACETIME_BUFF.id, event.timestamp)) {
      this.bonusDmg += calculateEffectiveDamage(event, LESSONS_OF_SPACETIME_DAMAGE_BONUS);
    }
  }

  on_byPlayerPet_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.LESSONS_OF_SPACETIME_BUFF.id, event.timestamp)) {
      this.bonusDmg += calculateEffectiveDamage(event, LESSONS_OF_SPACETIME_DAMAGE_BONUS);
    }
  }

  get uptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.LESSONS_OF_SPACETIME_BUFF.id) / this.owner.fightDuration;
  }
  item() {
    return {
      item: ITEMS.LESSONS_OF_SPACETIME,
      result: (<Wrapper>
        {formatPercentage(this.uptime)} % uptime on <SpellLink id={SPELLS.LESSONS_OF_SPACETIME_BUFF.id} icon/> <br />
        <ItemDamageDone amount={this.bonusDmg} />
      </Wrapper>),
    };
  }
}

export default LessonsOfSpaceTime;

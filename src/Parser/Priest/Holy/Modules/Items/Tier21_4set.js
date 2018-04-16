import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

const HOLY_PRIEST_TIER21_4SET_BUFF_EXPIRATION_BUFFER = 150; // the buff expiration can occur several MS before the heal event is logged, this is the buffer time that an IoL charge may have dropped during which it will still be considered active.

const HEALING_BONUS = 0.3;

class Tier21_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;
  procUsed = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HOLY_PRIEST_T21_4SET_BONUS_BUFF.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const hasBuff = this.combatants.selected.hasBuff(SPELLS.HOLY_PRIEST_EVERLASTING_HOPE.id, event.timestamp, HOLY_PRIEST_TIER21_4SET_BUFF_EXPIRATION_BUFFER);
    if (spellId === SPELLS.PRAYER_OF_HEALING.id && hasBuff) {
      this.healing += calculateEffectiveHealing(event, HEALING_BONUS);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const hasBuff = this.combatants.selected.hasBuff(SPELLS.HOLY_PRIEST_EVERLASTING_HOPE.id, event.timestamp, HOLY_PRIEST_TIER21_4SET_BUFF_EXPIRATION_BUFFER);
    if (spellId === SPELLS.PRAYER_OF_HEALING.id && hasBuff) {
      this.procUsed += 1;
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.HOLY_PRIEST_T21_4SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.HOLY_PRIEST_T21_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.HOLY_PRIEST_T21_4SET_BONUS_BUFF.id} icon={false} />,
      result: (
        <dfn data-tip={`A total of ${this.procUsed} procs were used.`}>
          <ItemHealingDone amount={this.healing} />
        </dfn>
      ),
    };
  }
}

export default Tier21_4set;

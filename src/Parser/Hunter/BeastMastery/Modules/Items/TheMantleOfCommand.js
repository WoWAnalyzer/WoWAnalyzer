import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';
import Wrapper from 'common/Wrapper';

const DAMAGE_INCREASE = 0.05;

/*
 * The Mantle of Command
 * Dire Beast (or Dire Frenzy) increases the damage done by your pets by 5% for 8 sec.
 */

class TheMantleOfCommand extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.THE_MANTLE_OF_COMMAND.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id && !this.combatants.selected.hasBuff(SPELLS.THE_MANTLE_OF_COMMAND_BUFF.id)) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, DAMAGE_INCREASE);
  }

  on_byPlayerPet_damage(event) {
    if (!this.combatants.selected.hasBuff(SPELLS.THE_MANTLE_OF_COMMAND_BUFF.id)) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, DAMAGE_INCREASE);
  }

  get buffUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.THE_MANTLE_OF_COMMAND_BUFF.id) / this.owner.fightDuration;

  }

  get buffUptimeThreshold() {
    if (this.combatants.selected.hasTalent(SPELLS.ONE_WITH_THE_PACK_TALENT.id)) {
      return {
        actual: this.buffUptime,
        isLessThan: {
          minor: 0.95,
          average: 0.90,
          major: 0.80,
        },
        style: 'percentage',
      };
    } else {
      return {
        actual: this.buffUptime,
        isLessThan: {
          minor: 0.85,
          average: 0.8,
          major: 0.70,
        },
        style: 'percentage',
      };
    }
  }

  suggestions(when) {
    when(this.buffUptimeThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>memes</Wrapper>)
        .icon(ITEMS.THE_MANTLE_OF_COMMAND.icon)
        .actual(`${formatPercentage(actual)}% uptime`)
        .recommended(`${formatPercentage(recommended)}% is recommended`);
    });
  }

  item() {
    return {
      item: ITEMS.THE_MANTLE_OF_COMMAND,
      result: (
        <dfn data-tip={`You had a ${formatPercentage(this.buffUptime)}% uptime on The Mantle of Command buff.`}>
          <ItemDamageDone amount={this.bonusDmg} />
        </dfn>
      ),
    };
  }
}

export default TheMantleOfCommand;

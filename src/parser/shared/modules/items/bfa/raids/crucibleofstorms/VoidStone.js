import React from 'react';

import { formatNumber, formatDuration } from 'common/format';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';

//Example Log: https://www.warcraftlogs.com/reports/vZQfwra1xVK76M4L/#fight=13&source=6

class VoidStone extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  static cooldown = 120; //seconds

  damageAbsorbed = 0;
  absorbedByUse = {};
  uses = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.VOID_STONE.id);
    if(!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.UMBRAL_SHELL), this._cast);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.UMBRAL_SHELL), this._absorb);

    this.abilities.add({
      spell: SPELLS.UMBRAL_SHELL,
      name: ITEMS.VOID_STONE.name,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      cooldown: this.constructor.cooldown,
      castEfficiency: {
        suggestion: false,
      },
    });
  }

  _cast(event){
    this.uses += 1;
    this.absorbedByUse[this.uses] = {time: event.timestamp - this.owner.fight.start_time, amount:0};
  }

  _absorb(event){
    this.damageAbsorbed += event.amount;
    this.absorbedByUse[this.uses].amount += event.amount;
  }


  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
            Uses: <b>{this.uses}</b><br />
            Total damage absorbed: <b>{formatNumber(this.damageAbsorbed)}</b><br />
            Average damage absorbed per shield: <b>{formatNumber(this.damageAbsorbed / this.uses)}</b><br />
            {this.uses > 0 &&
              <>Absorb per cast: <br />
                <ul>
                {Object.keys(this.absorbedByUse).map(use => {
                  return <li>Use <b>{use}</b> at <b>{formatDuration(this.absorbedByUse[use].time / 1000)}</b>: <b>{formatNumber(this.absorbedByUse[use].amount)}</b> damage absorbed</li>;
                })}
                </ul>
              </>
            }
          </>
        )}
      >
        <BoringItemValueText item={ITEMS.VOID_STONE}>
          <ItemHealingDone amount={this.damageAbsorbed} />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default VoidStone;

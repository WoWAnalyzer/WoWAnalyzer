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
    this.absorbedByUse[this.uses] = {
      time: event.timestamp - this.owner.fight.start_time,
      amount: 0,
      target: event.targetID,
    };
  }

  _absorb(event){
    this.damageAbsorbed += event.amount;
    this.absorbedByUse[this.uses].amount += event.amount;
  }

  get possibleUseCount() {
    return Math.ceil(this.owner.fightDuration / (this.constructor.cooldown * 1000));
  }


  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
            Uses: <b>{this.uses}</b> out of <b>{this.possibleUseCount}</b> possible use{this.possibleUseCount !== 1 && <>s</>}<br />
            Total damage absorbed: <b>{formatNumber(this.damageAbsorbed)}</b><br />
            Average damage absorbed per shield: <b>{formatNumber(this.damageAbsorbed / this.uses)}</b><br />
          </>
        )}
        dropdown={(
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Time</th>
                <th>Target</th>
                <th>Absorbed</th>
              </tr>
            </thead>
            <tbody>
              {
                Object.keys(this.absorbedByUse).map(use => {
                  const target = this.owner.players.find(player => player.id === this.absorbedByUse[use].target);
                  return (
                    <tr key={use}>
                      <th>{formatDuration(this.absorbedByUse[use].time / 1000)}</th>
                      <td>{target.name || <>Unknown</>}</td>
                      <td>{formatNumber(this.absorbedByUse[use].amount)}</td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
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

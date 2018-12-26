import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import AverageTargetsHit from 'interface/others/AverageTargetsHit';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'interface/others/ItemDamageDone';

class BladeRush extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLADE_RUSH_TALENT.id);

    if(!this.active){
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLADE_RUSH_DAMAGE), this._ondmg);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLADE_RUSH_TALENT), this._oncast);
  }

  damage = 0;
  hits = 0;
  casts = 0;

  _oncast(event){
    this.casts+=1;
  }
  _ondmg(event){
    this.damage+=event.amount;
    this.hits+=1;
  }

  get averageNumberOfTargetsHit(){
    return this.hits/this.casts;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.BLADE_RUSH_TALENT.id}
        value={<>
          <AverageTargetsHit casts={this.casts} hits={this.hits} />
        </>}
      />
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.BLADE_RUSH_TALENT.id} />}
        value={<ItemDamageDone amount={this.damage} />}
      />
    );
  }
}

export default BladeRush;

import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

const PROCCHANCE_INCREASE = 0.1;

class WeaponMaster extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.WEAPONMASTER_TALENT_OUTLAW.id);

    if(!this.active){
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SINISTER_STRIKE_PROC), this._onproc);
  }

  procs = 0;

  _onproc(event){
    this.procs+=1;
  }

  get weaponMasterGuesstimate(){
    return PROCCHANCE_INCREASE*this.procs;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.WEAPONMASTER_TALENT_OUTLAW.id}
        value={<ItemDamageDone amount={this.weaponMasterGuesstimate} />}
      />
    );
  }
}

export default WeaponMaster;

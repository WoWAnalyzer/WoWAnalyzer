import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import StatisticBox from 'Interface/Others/StatisticBox';

import {findByBossId} from 'Raids';

const mitigationBuffs = {'Paladin' : [SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF.id,
                                      SPELLS.ARDENT_DEFENDER.id,
                                      SPELLS.GUARDIAN_OF_ANCIENT_KINGS.id]};


class MitigationCheck extends Analyzer{

  static checks;
  static buffCheck;
  static checksPassed;
  static checksFailed;


  constructor(...args) {
    super(...args);
    this.checksPassed = 0;
    this.checksFailed = 0;
    const boss = findByBossId(this.owner.boss.id);
    if(boss !== null && boss.fight.hasOwnProperty('softMitigationChecks')){
      this.checks = Object.values(boss.fight.softMitigationChecks);
      if(typeof this.checks === "undefined"){
        this.checks = [];
      }
      this.buffCheck = mitigationBuffs[this.owner.player.type];
    }else{
      this.checks = [];
      this.buffCheck = [];
    }

  }


  on_toPlayer_damage(event){
    if(this.checks.includes(event.ability.guid)){
      if(this.buffCheck.some((e) => this.selectedCombatant.hasBuff(e))){
        this.checksPassed += 1;
      } else {
        this.checksFailed += 1;
      }
    }
  }


  statistic(){
    if(this.checksPassed + this.checksFailed === 0){
      return null;
    }
    return (
      <StatisticBox icon={<SpellIcon id={this.buffCheck[0]} />}
        value={`${formatPercentage(this.checksPassed/(this.checksPassed+this.checksFailed))} %`}
        label={`Soft mitigation checks passed.`}
        tooltip={`${this.checksPassed}/${this.checksPassed+this.checksFailed} of tank-targeted abilities were mitigated.`} />
    );
  }

}


export default MitigationCheck;

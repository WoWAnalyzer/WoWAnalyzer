import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import SpellLink from 'common/SpellLink';
import Enemies from 'Parser/Core/Modules/Enemies';

import {findByBossId} from 'raids/index';
import ExpandableStatisticBox from 'Interface/Others/ExpandableStatisticBox';

const debug = false;

class MitigationCheck extends Analyzer{
  static dependencies = {
    enemies: Enemies,
  };

  checks = [];
  buffCheck = [];
  debuffCheck = [];
  checksPassedMap = new Map();
  checksFailedMap = new Map();


  constructor(...args) {
    super(...args);
    if(this.owner.boss == null){
      this.active = false;
      return;
    }
    const boss = findByBossId(this.owner.boss.id);
    if(boss.fight.softMitigationChecks){
      this.checks = Object.values(boss.fight.softMitigationChecks);
      if(this.checks === undefined){
        this.checks = [];
      }
    }else {
      this.checks = [];
      this.buffCheck = [];
      this.debuffCheck = [];
    }
    this.checks.forEach((e) => {
      this.checksPassedMap.set(e, 0);
      this.checksFailedMap.set(e, 0);
    });
  }


  on_toPlayer_damage(event){
    const spell = event.ability.guid;
    if(this.checks.includes(spell) && !event.tick){
      debug&&console.log(this.buffCheck);
      debug&&console.log(this.debuffCheck);
      if(this.buffCheck.some((e) => this.selectedCombatant.hasBuff(e))){
        this.checksPassedMap.set(spell, this.checksPassedMap.get(spell)+1);
      } else {
        const enemy = this.enemies.getEntities()[event.sourceID];
        //We want to get the source rather than the player's target, so no getEntity().
        if(enemy && this.debuffCheck.some((e) => enemy.hasBuff(e, event.timestamp))){
          this.checksPassedMap.set(spell, this.checksPassedMap.get(spell)+1);
        } else {
          this.checksFailedMap.set(spell, this.checksFailedMap.get(spell)+1);
        }
      }
    }
  }


  statistic(){
    const failSum = Array.from(this.checksFailedMap.values()).reduce((total, val) => total + val, 0);
    const passSum = Array.from(this.checksPassedMap.values()).reduce((total, val) => total + val, 0);
    if(failSum + passSum === 0){
      return null;
    }
    let spellIconId;
    if(this.buffCheck.length > 0){
      spellIconId = this.buffCheck[0];
    } else {
      spellIconId = SPELLS.SHIELD_BLOCK_BUFF.id;
    }
    const presentChecks = [];
    this.checks.forEach(spell =>{
      if(this.checksPassedMap.get(spell) + this.checksFailedMap.get(spell) > 0) {
        presentChecks.push(spell);
      }
    }
    );
    return(
      <ExpandableStatisticBox icon={<SpellIcon id={spellIconId} />}
        value={`${formatPercentage(passSum / (passSum + failSum))} %`}
        label={`Soft mitigation checks passed.`}>
      <table className="table table-condensed" style={{ fontWeight: 'bold' }}>
        <thead>
          <tr>
            <th>Ability</th>
            <th>Passed</th>
            <th>Failed</th>
          </tr>
        </thead>
        <tbody>
          {
            presentChecks.map(spell => (
              <tr key={spell}>
                <th scope="row"><SpellLink id={spell} style={{ height: '2.5em' }} /></th>
                <td>{formatNumber(this.checksPassedMap.get(spell))}</td>
                <td>{formatNumber(this.checksFailedMap.get(spell))}</td>
              </tr>
            ))
          }
          </tbody>
      </table>
      </ExpandableStatisticBox>
    );
  }
}
export default MitigationCheck;

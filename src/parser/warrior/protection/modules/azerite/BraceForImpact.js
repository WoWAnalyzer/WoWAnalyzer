import React from 'react';

import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatMilliseconds } from 'common/format';
import SPELLS from 'common/SPELLS';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellLink from 'common/SpellLink';
import HIT_TYPES from 'game/HIT_TYPES';

import StatTracker from 'parser/shared/modules/StatTracker';
import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';

class BraceForImpact extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
    abilityTracker: AbilityTracker,
  };

  lastApplication = 0;
  currentStack = 0;
  stackMap;//this is a map of objects that their key is the number of stacks they are at. The object constist of buff uptime, number of shield slams casted at that stack count, and damage done by the trait at that stack count
  shieldBlockBuff = this.selectedCombatant.hasTalent(SPELLS.HEAVY_REPERCUSSIONS_TALENT.id) ? 1.6 : 1.3;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BRACE_FOR_IMPACT.id);
    if (!this.active) {
      return;
    }
    const ranks = this.selectedCombatant.traitRanks(SPELLS.BRACE_FOR_IMPACT.id) || [];
    this.traitDamage = ranks.reduce((total, rank) => total + calculateAzeriteEffects(SPELLS.BRACE_FOR_IMPACT.id, rank)[1], 0);
    this.stackMap = new Map();
    this.lastApplication = this.owner.fight.start_time;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if(!this.selectedCombatant.hasBuff(SPELLS.BRACE_FOR_IMPACT_BUFF.id)){
      return;
    }

    if(spellId !== SPELLS.SHIELD_SLAM.id){
      return;
    }

    let damageDone = this.traitDamage * this.currentStack;

    if(this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id)){
      damageDone = damageDone * this.shieldBlockBuff;
    }

    if(this.selectedCombatant.hasBuff(SPELLS.AVATAR_TALENT.id)){
      damageDone = damageDone * 1.2;
    }

    if(event.hitType === HIT_TYPES.CRIT){
      damageDone = damageDone * 2;
    }

    damageDone = Math.round(damageDone);

    this.stackMap.get(this.currentStack).damage += damageDone;
    this.stackMap.get(this.currentStack).ssCasts += 1;
  }

  //only triggered for first stack so we can build map ez pz here
  on_byPlayer_applybuff(event){
    const spellId = event.ability.guid;

    if(spellId !== SPELLS.BRACE_FOR_IMPACT_BUFF.id){
      return;
    }
    
    this.currentStack = 1;

    if(!this.stackMap.has(this.currentStack)){
      this.stackMap.set(this.currentStack, {
        damage: 0,
        uptime: 0,
        ssCasts: 0,
      });
    }

    this.lastApplication = event.timestamp;
  }

  on_byPlayer_applybuffstack(event){
    const spellId = event.ability.guid;

    if(spellId !== SPELLS.BRACE_FOR_IMPACT_BUFF.id){
      return;
    }

    this.updateUptime(event);

    this.currentStack += 1;

    if(!this.stackMap.has(this.currentStack)){
      this.stackMap.set(this.currentStack, {
        damage: 0,
        uptime: 0,
        ssCasts: 0,
      });
    }
  }

  on_byPlayer_removebuff(event){
    const spellId = event.ability.guid;

    if(spellId !== SPELLS.BRACE_FOR_IMPACT_BUFF.id){
      return;
    }

    this.updateUptime(event);

    this.currentStack = 0;
  }

  on_byPlayer_removebuffstack(event){
    const spellId = event.ability.guid;

    if(spellId !== SPELLS.BRACE_FOR_IMPACT_BUFF.id){
      return;
    }

    this.updateUptime(event);

    this.currentStack -= 1;
  }

  updateUptime(event){
    const timeDifference = event.timestamp - this.lastApplication;
    this.stackMap.get(this.currentStack).uptime += timeDifference;
    this.lastApplication = event.timestamp;
  }

  on_fightend(){
    if(this.currentStack>0){
      const timeDifference = this.owner.fight.end_time - this.lastApplication;
      this.stackMap.get(this.currentStack).uptime += timeDifference;
    }
    console.log(this.stackMap);
  }

  statistic() {
    const stacks = Array.from(this.stackMap.keys());
    return (
      <AzeritePowerStatistic
        size="flexible"
        tooltip={(
          <div>
            The damage this calculates doesn't factor into damage increases from non-warrior sources. 
        </div>
        )}
      >
      <div className="pad">
        <label><SpellLink id={SPELLS.BRACE_FOR_IMPACT.id} /></label>
        <div>
          Damage done by and uptime for <SpellLink id={SPELLS.BRACE_FOR_IMPACT.id} />
        </div>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Stacks</th>
              <th>Uptime</th>
              <th>Damage</th>
            </tr>
          </thead>
          <tbody>
            {
              stacks.map(stack => (
                <tr>
                <td>{stack}</td>
                <td>{formatMilliseconds(this.stackMap.get(stack).uptime)}</td>
                <td>{formatNumber(this.stackMap.get(stack).damage)}</td>
                </tr>
              ))
            }
            </tbody>
         </table>
        </div>
      </AzeritePowerStatistic>
    );
  }


}

export default BraceForImpact;

import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

/**
 * Every 60 Runic Power spent while Pillar of Frost is active increases the duration of Pillar of Frost by 1.0 sec.
 */

class Tier20_2p extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  pillarActive = false;
  totalPillarCasts = 0;
  totalAddedDuration = 0;
  currentAddedDuration = 0;
  rpBanked = 0;
  
  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.FROST_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id);
  }

  on_byPlayer_applybuff(event){
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.PILLAR_OF_FROST.id){
      return;
    }
    this.pillarActive = true;
    this.totalPillarCasts += 1;
  }

  on_byPlayer_removebuff(event){
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.PILLAR_OF_FROST.id){
      return;
    }
    this.pillarActive = false;
    this.totalAddedDuration += this.currentAddedDuration;
    this.currentAddedDuration = 0;
  }

  on_byPlayer_cast(event){
    const resource = event.classResources[0];
    if(resource.type !== 6 || this.pillarActive === false){
      return;
    }
    this.rpBanked = resource.hasOwnProperty("cost") ? this.rpBanked + resource.cost: this.rpBanked;
    if(this.rpBanked >= 600){
      this.rpBanked -= 600;
      this.currentAddedDuration += 1000;
    }
  }


  on_byPlayer_damage(event){ // BoS only shows up as damage events with no classResource prop but it ticks 1/sec and costs 15rp/sec so i can get the rp spent
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.BREATH_OF_SINDRAGOSA_TALENT_DAMAGE_TICK || this.pillarActive === false){
      return;
    }  
    this.rpBanked += 150;
    if(this.rpBanked >= 600){
      this.rpBanked -= 600;
      this.currentAddedDuration += 1000;  
    }  
  }

  item() {
    return {
      id: `spell-${SPELLS.FROST_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.FROST_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.FROST_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id} />,
      result: <dfn data-tip={`Added ${this.totalAddedDuration/1000} seconds over ${this.totalPillarCasts} Pillar of Frost casts during the fight.`}>
        Added an average of {((this.totalAddedDuration/1000)/this.totalPillarCasts).toFixed(1)} seconds to the duration of Pillar of Frost
      </dfn>,
    };
  }
}

export default Tier20_2p;
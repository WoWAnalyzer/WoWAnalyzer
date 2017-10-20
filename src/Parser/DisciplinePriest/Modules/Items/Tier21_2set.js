import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Module from 'Parser/Core/Module';
import isAtonement from '../Core/isAtonement';

import Atonement from '../Spells/Atonement';

const REGULAR_RADIANCE_COOLDOWN = 18000;
const T212SET_RADIANCE_COOLDOWN = 15000;

class Tier21_2set extends Module {
  static dependencies = {
    atonement: Atonement
  };

  timeSpentWithRadianceOnCD = 0;
  lastRadianceCast = 0;

  atonementDamageEvents = [];
  atonementHealingEvents = [];

  cpt = 1;

  atonementBlocks = [];

  _lastTimeStamp = 0;
  _lastAmount = 0;


  on_byPlayer_heal(event){
    if(!isAtonement(event)) return;

    // Atonement on self will be handled seperatly
    if(event.targetID === event.sourceID) return;

    var oh = event.overheal ? event.overheal : 0;

    // The Previous event is empty
    if(   this.atonementDamageEvents.length > 2
      &&  this.atonementDamageEvents[this.atonementDamageEvents.length -2].HealingEventsAssociated2.length == 0) {

      this.atonementDamageEvents[this.atonementDamageEvents.length -2].HealingEventsAssociated2.push(event.amount + oh);
      this.atonementDamageEvents[this.atonementDamageEvents.length -2].Effective.push(event.amount);
      return;
    }

    if(this.atonementDamageEvents.length > 2
      && this.atonementDamageEvents[this.atonementDamageEvents.length -2].HealingEventsAssociated2.length < this.atonementDamageEvents[this.atonementDamageEvents.length -2].Atonements
      && this.atonementDamageEvents[this.atonementDamageEvents.length -2].HealingEventsAssociated2.length > 0
      && (this.atonementDamageEvents[this.atonementDamageEvents.length -2].HealingEventsAssociated2[0] == event.amount + oh
          || this.atonementDamageEvents[this.atonementDamageEvents.length -2].HealingEventsAssociated2[0] == event.amount + oh - 1
        || this.atonementDamageEvents[this.atonementDamageEvents.length -2].HealingEventsAssociated2[0] == event.amount + oh + 1)
    ) {
        this.atonementDamageEvents[this.atonementDamageEvents.length -2].HealingEventsAssociated2.push(event.amount + oh);
        this.atonementDamageEvents[this.atonementDamageEvents.length -2].Effective.push(event.amount);
        return;
    }
    if(this.atonementDamageEvents.length == 0) return;
    this.atonementDamageEvents[this.atonementDamageEvents.length - 1].HealingEventsAssociated2.push(event.amount + oh);
    this.atonementDamageEvents[this.atonementDamageEvents.length - 1].Effective.push(event.amount);
  }

  on_byPlayer_damage(event){
    if(!event.targetIsFriendly)
    //console.log(event);
      this.atonementDamageEvents.push({"DamageEvent":event.ability.name,"Atonements": this.atonement.numAtonementsActive, "Damage": event.amount, "HealingEventsAssociated2":[], "Effective":[]});
  }

  on_initialized() {
    //this.active = this.owner.modules.combatants.selected.hasBuff(SPELLS.DISC_PRIEST_T21_2SET_BONUS_PASSIVE.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.POWER_WORD_RADIANCE.id) {
      return;
    }
    this.timeSpentWithRadianceOnCD += T212SET_RADIANCE_COOLDOWN;
    this.lastRadianceCast = event.timestamp;
  }

  reorderEvents(events) {
    var imp = [];
    var i;
    for(i = 0; i < events.length;i++){
      if((events[i].type == "heal" && isAtonement(events[i])) || events[i].type == "damage" ){
        if(events[i].timestamp>1031513 && events[i].timestamp<1046955)
        imp.push(events[i]);
      }
    }
    console.log(imp);
    return events;
  }

  on_finished(){
    var result = {};
    var i;
    var j;
    for(i = 0; i < this.atonementDamageEvents.length; i++){
      if(!result[this.atonementDamageEvents[i].DamageEvent]) {
        result[this.atonementDamageEvents[i].DamageEvent] = 0;
      }

      for(j = 0; j < this.atonementDamageEvents[i].HealingEventsAssociated2.length; j++){
        result[this.atonementDamageEvents[i].DamageEvent] += this.atonementDamageEvents[i].Effective[j];
      }


    }

    console.log(this.atonementDamageEvents)
    console.log(result);
  }

  item() {
    return {
      id: `spell-${SPELLS.DISC_PRIEST_T21_2SET_BONUS_PASSIVE.id}`,
      icon: <SpellIcon id={SPELLS.POWER_WORD_RADIANCE.id} />,
      title: <SpellLink id={SPELLS.DISC_PRIEST_T21_2SET_BONUS_PASSIVE.id} />,
      result: (
        <span>
          {(this.timeSpentWithRadianceOnCD / REGULAR_RADIANCE_COOLDOWN * ((REGULAR_RADIANCE_COOLDOWN-T212SET_RADIANCE_COOLDOWN)/1000)).toFixed(1) } seconds off the Power Word: Radiance cooldown.
        </span>
      ),
    };
  }
}

export default Tier21_2set;

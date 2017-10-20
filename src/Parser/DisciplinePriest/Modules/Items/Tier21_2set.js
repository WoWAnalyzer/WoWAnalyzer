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

  on_byPlayer_heal(event){
    if(!isAtonement(event)) return;

    if(this.atonementDamageEvents.length> 0){
      this.atonementDamageEvents[this.atonementDamageEvents.length -1].HealingEventsAssociated2.push(event);
      this.atonementDamageEvents[this.atonementDamageEvents.length -1].Effective.push(event.amount);
      var oh = event.overheal ? event.overheal : 0;
      this.atonementDamageEvents[this.atonementDamageEvents.length -1].NonEffective.push(event.amount + oh);
    }
  }
  on_damage(event){
    if(!event.targetIsFriendly)
      this.atonementDamageEvents.push({
        "DamageEvent":event.ability.name,
        "Atonements": this.atonement.numAtonementsActive,
        "Damage": event.amount,
        "HealingEventsAssociated2":[],
        "Effective":[],
        "NonEffective":[]
      });
  }

  on_initialized() {
    //this.active = this.owner.modules.combatants.selected.hasBuff(SPELLS.DISC_PRIEST_T21_2SET_BONUS_PASSIVE.id);
  }

  reorderEvents(events) {

    var i;
    var j;

    for(i = 0; i < events.length;i++){
      if(events[i].type == "heal" && isAtonement(events[i]) && events[i].sourceID == events[i].targetID){
        for(j = i + 1; j < events.length; j++){
          if(events[j].type == "heal" && isAtonement(events[i])){
              var temp = events[j - 1];
              events[j - 1] = events[i];
              events[i] = temp;
              break;
          }
        }
      }
    }

    var atonementsEvents = [];
    var atonementsEvents2 = [];
    for(i = 1; i < events.length;i++){
      // 2 suceeding damage events
      if( events[i].sourceIsFriendly && events[i].type == "damage" && events[i - 1].sourceIsFriendly && events[i -1].type == "damage") {
        atonementsEvents = [];
        for(j = i + 1; j < events.length; j++) {
          if(events[j].sourceIsFriendly && events[j].type == "damage")
            break;

          if(events[j].type == "heal" && isAtonement(events[j]))
            atonementsEvents.push(events[j]);
        }

        atonementsEvents2.push({"Event1": events[i - 1], "Event2": events[i], "Atos": atonementsEvents})

        events[i] = events.splice(i + (atonementsEvents.length / 2), 1, events[i])[0];
      }
    }
    console.log(atonementsEvents2);

    var imp = [];

    for(i = 0; i < events.length;i++){
      //f((events[i].type == "heal" && isAtonement(events[i])) || events[i].type == "damage" ){
      //  if(events[i].sourceIsFriendly)
        imp.push(events[i]);

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

    console.log(result.length);

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

import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Module from 'Parser/Core/Module';
import isAtonement from '../Core/isAtonement';

import Atonement from '../Spells/Atonement';

class AtonementAttribution extends Module {
  static dependencies = {
    atonement: Atonement
  };

  healingBreakdown;

  atonementDamageEvents = [];

  on_byPlayer_heal(event){
    if(!isAtonement(event)) return;

    if(this.atonementDamageEvents.length> 0){
      var oh = event.overheal ? event.overheal : 0;
      let lastDamageEvent = this.atonementDamageEvents[this.atonementDamageEvents.length -1];
      lastDamageEvent.HealingEventsAssociated2.push(event);
      lastDamageEvent.Effective.push(event.amount);
      lastDamageEvent.NonEffective.push(event.amount + oh);
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

  reorderEvents(events) {

    let i;
    let j;
    for(i = 0; i < events.length;i++){
      if(events[i].type === "heal" && isAtonement(events[i]) && events[i].sourceID === events[i].targetID){
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

    for(i = 1; i < events.length;i++){

      if( events[i].sourceIsFriendly && events[i].type == "damage" && events[i - 1].sourceIsFriendly && events[i -1].type == "damage") {
        atonementsEvents = [];
        for(j = i + 1; j < events.length; j++) {
          if(events[j].sourceIsFriendly && events[j].type == "damage")
            break;

          if(events[j].type == "heal" && isAtonement(events[j]))
            atonementsEvents.push(events[j]);
        }
        events[i] = events.splice(i + (atonementsEvents.length / 2), 1, events[i])[0];
      }
    }
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
    }/*
    var corrected = 0
    for(i = 0; i < this.atonementDamageEvents.length - 1; i++) {

      if(this.atonementDamageEvents[i].HealingEventsAssociated2.length == 0 &&
        this.atonementDamageEvents[i +1].HealingEventsAssociated2.length > 0 &&
        this.atonementDamageEvents[i +1].HealingEventsAssociated2.length == this.atonementDamageEvents[i +1].Atonements * 2) {
        corrected ++;
        this.atonementDamageEvents[i].HealingEventsAssociated2 = this.atonementDamageEvents[i +1].HealingEventsAssociated2.splice(0,this.atonementDamageEvents[i +1].Atonements);
        this.atonementDamageEvents[i].Effective = this.atonementDamageEvents[i +1].Effective.splice(0,this.atonementDamageEvents[i +1].Atonements);
        this.atonementDamageEvents[i].NonEffective = this.atonementDamageEvents[i +1].NonEffective.splice(0,this.atonementDamageEvents[i +1].Atonements);
      }
    }
    console.log(corrected);*/

    for(var spell in result) {
      let spellPct = (this.owner.getPercentageOfTotalHealingDone(result[spell]) * 100).toFixed(2);
      result[spell] = spellPct;
    }

    this.healingBreakdown = result;

    console.log(this.atonementDamageEvents);


    let problems = [];
    for(i = 0; i < this.atonementDamageEvents.length; i++){
      if(this.atonementDamageEvents[i].HealingEventsAssociated2.length == 0 && this.atonementDamageEvents[i].Atonements > 0){
        problems.push({"Event": this.atonementDamageEvents[i], "Before": this.atonementDamageEvents[i -1], "ZAfter": this.atonementDamageEvents[i + 1], "ZBafter": this.atonementDamageEvents[i + 2]});
      }
    }
    console.log(problems);
  }

  item() {

    let atonementAttribution = "";
    if(this.healingBreakdown){

      for(var spell in this.healingBreakdown) {
         atonementAttribution += spell + ": " + this.healingBreakdown[spell] + "% ";
      }
    }

    return {
      id: `spell-${SPELLS.ATONEMENT_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.ATONEMENT_BUFF.id} />,
      title: <SpellLink id={SPELLS.ATONEMENT_BUFF.id} />,
      result: (
        atonementAttribution
      ),
    };
  }
}

export default AtonementAttribution;

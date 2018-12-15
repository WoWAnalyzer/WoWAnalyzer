import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
//import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

//const INNERVATE_DURATION = 12000;

//See rampant growth PR if issues adding an azerite trait 
//https://github.com/WoWAnalyzer/WoWAnalyzer/pull/2663/files


//Log for implementation/debuggnig 
//Link to search by early harvest on fetid M (can be tweaked)
//https://www.warcraftlogs.com/zone/rankings/19#boss=2128&class=Druid&spec=Restoration&metric=hps&search=abilities.287255
//First one that actually has early harvest (not all do) and has name with english characters 
//https://www.warcraftlogs.com/reports/vMQ2YLzF917CtTdf#fight=27&type=healing

class EarlyHarvest extends Analyzer{

  constructor(...args){
    super(...args);
    this.active = true;
    //this.active = this.selectedCombatant.hasTrait(SPELLS..id);
    if(this.active) {
        //TODO log results of traits by spellID to determine id of early harvest 
        //
      //this.avgItemLevel = this.selectedCombatant.traitsBySpellId[SPELLS.LIVELY_SPIRIT_TRAIT.id]
        //.reduce((a, b) => a + b) / this.selectedCombatant.traitsBySpellId[SPELLS.LIVELY_SPIRIT_TRAIT.id].length;
      //this.traitLevel = this.selectedCombatant.traitsBySpellId[SPELLS.LIVELY_SPIRIT_TRAIT.id].length;
      //this.intGainPerSpell = this.selectedCombatant.traitsBySpellId[SPELLS.LIVELY_SPIRIT_TRAIT.id]
        //.reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.LIVELY_SPIRIT_TRAIT.id, rank)[0], 0);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(SPELLS.INNERVATE.id === spellId && event.sourceId === event.targetId) {
      this.innervateTimestamp = event.timestamp;
    }

    //if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)
          // && this.ABILITIES_BUFFING_LIVELY_SPIRIT.includes(spellId)
          // && this.innervateTimestamp !== 0
          // && (this.innervateTimestamp+INNERVATE_DURATION) >= event.timestamp) {
    // }
  }

  // on_toPlayer_removebuff(event) {
    // const spellId = event.ability.guid;
    // if (SPELLS.LIVELY_SPIRIT_BUFF.id === spellId) {
      // this.livelySpirits.push(this.intGainPerSpell * this.castsDuringInnervate);
      // this.castsDuringInnervate = 1;
      // this.innervateTimestamp = 0;
    // }
  // }

  statistic(){
    
    //const ilvlGain = findItemLevelByPrimaryStat(getPrimaryStatForItemLevel(this.avgItemLevel) + this.intGain) - this.avgItemLevel;

    return(
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.LIVELY_SPIRIT_TRAIT.id}
        value={(
          <>
            {formatNumber(this.intGain)} average Intellect gained.<br />
          </>
        )}
        tooltip={'Hello Tooltip, it\'s me, Early Harvest')
    );
  }
}

export default EarlyHarvest;

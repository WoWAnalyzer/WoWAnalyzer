import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';

/* ---------------------------- Log URLs for testing --------------------------

for DIVINE_PURPOSE testing (A):

    A1: 100% uptime with precast: 
        https://www.warcraftlogs.com/reports/fWdJahyD9KGz1rwk/#fight=16&source=14
    A2: < 100% uptime with precast: 
        https://www.warcraftlogs.com/reports/fWdJahyD9KGz1rwk/#fight=58&source=14&type=auras&by=target&ability=53563
    A3: < 100% without precast: 
        https://www.warcraftlogs.com/reports/fWdJahyD9KGz1rwk/#fight=56&source=14&type=auras&by=target&ability=53563
    A4: 100% uptime with precast with BoL swap: 
        https://www.warcraftlogs.com/reports/fWdJahyD9KGz1rwk/#fight=50&source=14&type=auras&by=target&ability=53563
    A5: < 100% uptime with precast with BoL swap: 
        https://www.warcraftlogs.com/reports/fWdJahyD9KGz1rwk/#fight=54&source=14&type=auras&by=target&ability=53563
    A6: < 100% without precast with BoL swap: 
        https://www.warcraftlogs.com/reports/fWdJahyD9KGz1rwk/#fight=53&source=14&type=auras&by=target&ability=53563

for BEACON_OF_FAITH testing (B):

    BoF uptime (B1*):
        B11: 100% uptime with precast: Getting slightly less than 100%
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=2&source=7&type=auras&by=target&ability=53563
        B12: < 100% uptime with precast: 
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=13&source=7&type=auras&by=target&ability=156910
        B13: < 100% without precast: 
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=10&source=7&type=auras&by=target&ability=156910
        B14: 100% uptime with precast with BoF swap: 
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=11&source=7&type=auras&by=target&ability=156910
        B15: < 100% uptime with precast with BoF swap: 
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=8&source=7&type=auras&by=target&ability=156910
        B16: < 100% without precast with BoF swap: 
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=14&source=7&type=auras&by=target&ability=156910
    BoL uptime (B2*):
        B21: 100% uptime with precast: 
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=2&source=7&type=auras&by=target&ability=53563
        B22: < 100% uptime with precast: 
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=9&source=7&type=auras&by=target&ability=53563
        B23: < 100% without precast: 
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=14&source=7&type=auras&by=target&ability=53563
        B24: 100% uptime with precast with BoL swap: 
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=8&source=7&type=auras&by=target&ability=53563
        B25: < 100% uptime with precast with BoL swap: 
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=19&source=7&type=auras&by=target&ability=53563
        B26: < 100% without precast with BoL swap:

For Beacon of Virtue (C)
    C:
        https://www.warcraftlogs.com/reports/Pngamcw6pfWVGDMj#fight=22&type=auras&source=2&by=target


-----------------------------------------------------------------------------*/

class BeaconUptime extends Analyzer {
    constructor(...args) {
        super(...args);

        this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this._onBuff);
        this.addEventListener(Events.removebuff.by(SELECTED_PLAYER), this._offBuff);

        // Due to getBuffHistory for BoV, uptime is calculated at the end of the fight
        this.addEventListener(Events.fightend, this._updateBoV);
        
        // this is really has divine purpose talent
        this.hasBoL = this.selectedCombatant.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id);

        this.hasBoF = this.selectedCombatant.hasTalent(SPELLS.BEACON_OF_FAITH_TALENT.id);
        this.hasBoV = this.selectedCombatant.hasTalent(SPELLS.BEACON_OF_VIRTUE_TALENT.id);
        
        this.idBoL = SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id;
        this.idBoF = SPELLS.BEACON_OF_FAITH_TALENT.id;
        this.idBoV = SPELLS.BEACON_OF_VIRTUE_TALENT.id;

        this.BuffEventType = Object.freeze({removeBuff: 0, prepull: 1, postpull: 2, UPDATE: 3});

        this.testing = false;
    }
    
    missingBoLPrepull = true;
    missingBoFPrepull = true;
    missingBoL = true;
    missingBoF = true;
    missingBoV = true;

    fightStart = this.owner.fight.start_time;
    fightEnd = this.owner.fight.end_time;
    fightLength = this.fightEnd - this.fightStart;
    
    lastBoLtimestamp = null;
    lastBoFtimestamp = null;
    lastBoVtimestamp = null;

    uptimeBoL = 0;
    uptimeBoF = 0;
    uptimeBoV = 0;

    // BoL is placed on a new target before it is removed from old target
    // so if the count is 2 then it will not set missingBoL to true
    countBoL = 0;
    countBoF = 0;

    get uptimeBoLPerc() {
      return Math.round(this.uptimeBoL / this.fightLength * 100);
    }

    get uptimeBoFPerc() {
      return Math.round(this.uptimeBoF / this.fightLength * 100);
    }

    get uptimeBoVPerc() {
      return Math.round(this.uptimeBoV / this.fightLength * 100);
    }

    get suggestionThresholdsBoL() {
      return {
        actual: !this.missingBoLPrepull,
        isEqual: false,
        style: 'boolean',
      };
    }

    get suggestionThresholdsBoLUptime() {
      return {
        actual: this.uptimeBoLPerc/100,
        isLessThan: {
          minor: 0.90,
          average: 0.80,
          major: 0.60,
        },
        style: 'percentage',
      };
    }

    get suggestionThresholdsBoF() {
      return {
        actual: !this.missingBoFPrepull,
        isEqual: false,
        style: 'boolean',
      };
    }

    get suggestionThresholdsBoFUptime() {
      return {
        actual: this.uptimeBoFPerc/100,
        isLessThan: {
          minor: 0.90,
          average: 0.80,
          major: 0.60,
        },
        style: 'percentage',
      };
    }

    // function to format time so that its easier to read
    _currentTime(eventTime) {
      //converted to decimal minutes
      const decimalTime = (eventTime-this.fightStart)/1000/60; 
      //gets whole minutes
      const min = decimalTime - decimalTime % 1;
      //converts decimal of minutes into seconds
      const seconds = ((decimalTime % 1) * 60).toFixed(2);
      
      return (`${min}:${seconds}`); 
    }
    
    _updateBoL(event,type) {
      const {removeBuff,prepull,postpull,update} = this.BuffEventType;

      // buff removed
      if(type === removeBuff && this.countBoL < 2) {
        this.missingBoL = true;
        this.uptimeBoL += event.timestamp - this.lastBoLtimestamp;
        this.lastBoLtimestamp = event.timestamp;
        this.countBoL--;
        return;
      }
      // checks for overlap of beacon application with beacon removal
      // should never be >2 but just in case
      if(type === removeBuff && this.countBoL >= 2) {
        this.countBoL--;
        return;
      }
      //buff applied prepull
      if(type === prepull) {
        this.missingBoLPrepull = false;
        this.missingBoL = false;
        this.lastBoLtimestamp = this.fightStart;
        this.countBoL++;
        return;
      }
      //buff applied post pull
      if(type === postpull) {
        this.lastBoLtimestamp = event.timestamp;
        this.missingBoL = false;
        this.countBoL++;
        return;
      }
      //buff not changed but updated
      if(type === update) {
        this.uptimeBoL += event.timestamp - this.lastBoLtimestamp;
        this.lastBoLtimestamp = event.timestamp;
        return;
      }
    }

    _updateBoF(event,type) {
      const {removeBuff,prepull,postpull,update} = this.BuffEventType;
      
      // buff removed
      if(type === removeBuff && this.countBoF < 2) {
        this.missingBoF = true;
        this.uptimeBoF += event.timestamp - this.lastBoFtimestamp;
        this.lastBoFtimestamp = event.timestamp;
        this.countBoF--; 
      }
      // checks for overlap of beacon application with beacon removal
      // should never be >2 but just in case
      if(type === removeBuff && this.countBoF >= 2) {
        this.countBoF--;
        return;
      }
      //buff applied prepull
      if(type === prepull) {
        this.missingBoFPrepull = false;
        this.missingBoF = false;
        this.lastBoFtimestamp = this.fightStart;
        this.countBoF++;
        return;
      }
      //buff applied post pull
      if(type === postpull) {
        this.lastBoFtimestamp = event.timestamp;
        this.missingBoF = false;
        this.countBoF++;
        return;
      }
      //buff not changed but updated
      if(type === update) {
        this.uptimeBoF += event.timestamp - this.lastBoFtimestamp;
        this.lastBoFtimestamp = event.timestamp;
        return;
      }
    }

    _updateBoV() {
      if(this.hasBoV){
        const historyBoV = this.selectedCombatant.getBuffHistory(this.idBoV);
          historyBoV.forEach((event) => {
          this.uptimeBoV += (event.end - event.start);
        });
      }
    }

    _handleBoLBuffs(event) {
      const {postpull,update} = this.BuffEventType;

      if(event.ability.guid === this.idBoL) {
        this._updateBoL(event,postpull);
        return;
      }
      if(!this.missingBoL) {
        this._updateBoL(event,update);
        return;
      }
    }

    _handleBoFBuffs(event) {
      const {postpull,update} = this.BuffEventType;

      // post pull BoF buff applied
      if(event.ability.guid === this.idBoF) {
        this._updateBoF(event,postpull);
        return;
      }
      if(event.ability.guid === this.idBoL) {
        this._updateBoL(event,postpull);
        return;
      }
      // if both BoL and BoF are active
      if(!this.missingBoL && !this.missingBoF) {
        this._updateBoL(event,update);
        this._updateBoF(event,update);
        return;
      }
      // if BoF is active and BoL is not active
      if(!this.missingBoF && this.missingBoL) {
        this._updateBoF(event,update);
        return;
      }
      // if BoF is not active and BoL not active
      if(this.missingBoF && !this.missingBoL) {
        this._updateBoL(event,update);
        return;
      }
      // if BoF and BoL are not active do nothing
    }

    _offBuff(event) {   
      const {removeBuff} = this.BuffEventType;

      if( ( this.hasBoL || this.hasBoF ) && event.ability.guid === this.idBoL ) {
        this._updateBoL(event,removeBuff);
        return;
      }
      if( this.hasBoF && event.ability.guid === this.idBoF ) {
        this._updateBoF(event,removeBuff);
        return;
      }
    }

    _onPrepull(event) {
      const {prepull} = this.BuffEventType;
      
      // prepull check for BoL active
      if(this.hasBoL && event.ability.guid === this.idBoL) {
        this._updateBoL(event,prepull);
        return;
      }

      // prepull check for BoF active
      if(this.hasBoF && event.ability.guid === this.idBoF) {
        this._updateBoF(event,prepull);
        return;
      }
      if(this.hasBoF && event.ability.guid === this.idBoL) {
        this._updateBoL(event,prepull);
        return;
      }
    }

    _onBuff(event) {
      
      // prepull check
      if(event.prepull && event.timestamp <= this.fightStart ) {
        this._onPrepull(event);
        return;
      }

      // all postpull checks

      if(this.hasBoL) {
        this._handleBoLBuffs(event);
        return;
      }

      if(this.hasBoF) {
        this._handleBoFBuffs(event);
        return;
      }
    }
    

statistic() {

  const boringSpellValueContainer = {display: "flex", flexDirection: "row" };
  const missingPrepullContainer = ( 
      <div style={{color: "red", margin: "auto", textAlign: "center"}}>
      <Trans>Not<br />casted<br />prepull</Trans></div> 
    );
    
  return (
    <Statistic
      position={STATISTIC_ORDER.CORE(60)}
      size={'flexible'}
      >
      <label style={{margin: "10px"}}><Trans>Beacon Uptime</Trans></label>
      
      {/*  adds a section for BoL stats if BoV talent is not taken */}
      {!this.hasBoV && 
      (
        <div style={boringSpellValueContainer}>
        <BoringSpellValue
          spell={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF}
          value={`${this.uptimeBoLPerc}%`}
          label={<Trans>BoL Uptime</Trans>} />
        {this.missingBoLPrepull && missingPrepullContainer}
        </div>
      )}
        
      {/* adds a section for BoF stats if BoF talent taken */}
      {this.hasBoF && 
      (
        <div style={boringSpellValueContainer}>
        <BoringSpellValue
          spell={SPELLS.BEACON_OF_FAITH_TALENT}
          value={`${this.uptimeBoFPerc}%`}
          label={<Trans>BoF Uptime</Trans>} />
        
        {this.missingBoFPrepull && missingPrepullContainer}
        </div>
      )}

      {/* adds a section for BoV stats if BoV talent taken */}
      {this.hasBoV && 
      (
        <div style={boringSpellValueContainer}>
        <BoringSpellValue
          spell={SPELLS.BEACON_OF_VIRTUE_TALENT}
          value={`${this.uptimeBoVPerc}%`}
          label={<Trans>BoV Uptime</Trans>} />
        </div>
      )}
    </Statistic>
    );
  }
}

export default BeaconUptime;
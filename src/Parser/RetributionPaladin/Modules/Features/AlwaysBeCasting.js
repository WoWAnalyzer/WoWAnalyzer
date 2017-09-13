import React from 'react';
import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';

import {formatPercentage} from 'common/format';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {

  static ABILITIES_ON_GCD = [

    //Holy Power Builders
    SPELLS.CRUSADER_STRIKE.id,
    SPELLS.ZEAL_TALENT.id,
    SPELLS.BLADE_OF_JUSTICE.id,
    SPELLS.DIVINE_HAMMER_TALENT.id,
    SPELLS.WAKE_OF_ASHES.id,

    //Holy Power Spenders
    SPELLS.TEMPLARS_VERDICT.id,
    SPELLS.DIVINE_STORM.id,
    SPELLS.EXECUTION_SENTENCE_TALENT.id,
    SPELLS.JUSTICARS_VENGEANCE_TALENT.id,
    SPELLS.WORD_OF_GLORY_TALENT.id,

    //Other DPS Abilities
    SPELLS.JUDGMENT_CAST.id,
    SPELLS.CONSECRATION_TALENT.id,
    SPELLS.HOLY_WRATH_TALENT.id,

    //Utility
    SPELLS.DIVINE_STEED.id,
    SPELLS.BLINDING_LIGHT_TALENT.id,
    SPELLS.REPENTANCE_TALENT.id,
    SPELLS.EYE_FOR_AN_EYE_TALENT.id,
    SPELLS.FLASH_OF_LIGHT.id,
    SPELLS.JUDGMENT_CAST.id,
    SPELLS.CRUSADER_STRIKE.id,
    225141, // http://www.wowhead.com/spell=225141/fel-crazed-rage (Draught of Souls)
    SPELLS.DIVINE_STEED.id,
    26573, // Consecration
    SPELLS.BLINDING_LIGHT_TALENT.id,
    642, // Divine Shield
    SPELLS.LAY_ON_HANDS.id,
    SPELLS.BLESSING_OF_FREEDOM.id,
    1022, // Blessing of Protection
    853, // Hammer of Justice
    SPELLS.HAND_OF_RECKONING.id,
  ];

 statistic() { 
   const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration; 
  
   return ( 
     <StatisticBox 
       icon={<Icon icon='petbattle_health-down' alt='Dead time' />} 
       value={`${formatPercentage(deadTimePercentage)} %`} 
       label='Dead time' 
       tooltip='Dead time is available casting time not used for casting any spell. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/being stunned), etc.' 
     /> 
   ); 
 } 
  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default AlwaysBeCasting;

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import indexById from 'common/SPELLS';

import {ABILITIES_AFFECTED_BY_HEALING_INCREASES} from '../../Constants';
import {HEALS_MASTERY_STACK} from '../../Constants';

class Mastery extends Module {

  hotHealingMap = new Map();
  for(let healId of HEALS_MASTERY_STACK) {
    hotHealingMap.set(healId, {'name':indexById(healId).name, 'direct':0, 'mastery':0});
  }

  // TODO: is this already handled by WoWAnalyzer system, can I just query for this?
  hotsOnTarget = new Map(); // map from playerId to set of hotIds on that player

  masteryBuffs = new Map([
      [ SPELLS.ASTRAL_HARMONY.id, { 'spell':SPELLS.ASTRAL_HARMONY, 'amount':4000 } ],
      [ SPELLS.JACINS_RUSE.id, { 'spell':SPELLS.JACINS_RUSE, 'amount':3000 } ],
  ]);
  for(let[buffId, buffObj] of masteryBuffs.entries()) {
		buffObj.attributableHealing = 0;
		buffObj.isActive = false; // TODO: is buff presence already handled by WoWAnalyzer?
	}



}


export default Mastery;

import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import SoulShardTracker from '../SoulShards/SoulShardTracker';

const debug = true;

const SHADOWBURN_DEBUFF_DURATION = 5000;
const SHADOWBURN_KILL = 'Shadowburn kill';

class Shadowburn extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
    combatants: Combatants,
  };

  _expectedShadowburnDebuffEnds = []; // we can have up to 2 Shadowburn debuffs active on mobs (it has 2 charges)

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SHADOWBURN_TALENT.id);
  }

  on_byPlayer_applydebuff(event) {
    if (event.ability.guid === SPELLS.SHADOWBURN_TALENT.id) {
      this._expectedShadowburnDebuffEnds.push({
        targetID: event.targetID,
        targetInstance: event.targetInstance,
        expectedEnd: event.timestamp + SHADOWBURN_DEBUFF_DURATION,
      });

      debug && console.log('Shadowburn applydebuff, debuffEnds:', JSON.stringify(this._expectedShadowburnDebuffEnds));
    }
  }

  on_byPlayer_refreshdebuff(event) {
    if (event.ability.guid === SPELLS.SHADOWBURN_TALENT.id) {
      this._expectedShadowburnDebuffEnds.forEach((debuff) => {
        if (debuff.targetID === event.targetID && debuff.targetInstance === event.targetInstance) {
          debug && console.log('found SB, refreshing');
          debuff.expectedEnd = event.timestamp + SHADOWBURN_DEBUFF_DURATION;
        }
      });

      debug && console.log('Shadowburn refreshdebuff, debuffEnds:', JSON.stringify(this._expectedShadowburnDebuffEnds));
    }
  }

  on_byPlayer_removedebuff(event) {
    if (event.ability.guid === SPELLS.SHADOWBURN_TALENT.id) {
      // find the expected end timestamp for the given debuff
      const debuffTargetIndex = this._expectedShadowburnDebuffEnds.findIndex(debuff => debuff.targetID === event.targetID && debuff.targetInstance === event.targetInstance);
      if (debuffTargetIndex === -1) { // should always exist, if not then panic and bail out
        return;
      }

      if (event.timestamp < this._expectedShadowburnDebuffEnds[debuffTargetIndex].expectedEnd) {
        // Shadowburn debuff expired sooner than it should = target died = generate another 5 fragments
        debug && console.log('Shadowburn kill');
        event.isFromShadowburnKill = true;
        this.owner.triggerEvent(event);
      }
      this._expectedShadowburnDebuffEnds.splice(debuffTargetIndex, 1); // remove the debuff from array
      debug && console.log('Shadowburn removedebuff (end), debuffEnds:', JSON.stringify(this._expectedShadowburnDebuffEnds));
    }
  }

  subStatistic() {
      return (
        <div className="flex">
          <div className="flex-main">
            <SpellLink id={SPELLS.SHADOWBURN_TALENT.id}>
              <SpellIcon id={SPELLS.SHADOWBURN_TALENT.id} noLink /> Shadowburn Gain
            </SpellLink>
          </div>
          <div className="flex-sub text-right">
            {this.soulShardTracker.generatedAndWasted[SHADOWBURN_KILL].generated} Bonus Fragments
          </div>
        </div>
      );
    }
}

export default Shadowburn;

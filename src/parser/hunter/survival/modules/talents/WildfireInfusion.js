import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import Enemies from 'parser/shared/modules/Enemies';
import StatTracker from 'parser/shared/modules/StatTracker';
import { SERPENT_STING_SV_BASE_DURATION, WILDFIRE_INFUSION_DOTS, WILDFIRE_INFUSION_IMPACT } from 'parser/hunter/survival/constants';

/**
 * Lace your Wildfire Bomb with extra reagents, randomly giving it one of the following enhancements each time you throw it:
 *
 * Shrapnel Bomb:
 * Shrapnel pierces the targets, causing Mongoose Bite, Raptor Strike, Butchery and Carve to apply a bleed for 9 sec that stacks up to 3 times.
 *
 * Pheromone Bomb:
 * Kill Command has a 100% chance to reset against targets coated with Pheromones.
 *
 * Volatile Bomb:
 * Reacts violently with poison, causing an extra explosion against enemies suffering from your Serpent Sting and refreshes your Serpent Stings.
 *
 * Example log: https://www.warcraftlogs.com/reports/n8AHdKCL9k3rtRDb#fight=36&type=damage-done
 */

class WildfireInfusion extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    statTracker: StatTracker,
  };

  activeSerpentStings = {
    /*
    [encodedTargetString]: {
        targetName: name,
        cast: timestamp,
        expectedEnd: timestamp,
        extendStart: timestamp || null,
        extendExpectedEnd: timestamp || null,
      },
     */
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.WILDFIRE_INFUSION_TALENT.id);
  }

  _serpentApplication(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    const hastedSerpentStingDuration = SERPENT_STING_SV_BASE_DURATION / (1 + this.statTracker.currentHastePercentage);
    this.activeSerpentStings[target] = {
      targetName: enemy.name,
      cast: event.timestamp,
      expectedEnd: event.timestamp + hastedSerpentStingDuration,
      extendStart: null,
      extendExpectedEnd: null,
    };
  }

  _maybeSerpentStingExtend(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);

  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (!WILDFIRE_INFUSION_DOTS.includes(spellId) && spellId !== SPELLS.SERPENT_STING_SV.id) {
      return;
    }
    if (spellId === SPELLS.SERPENT_STING_SV.id) {
      this._serpentApplication(event);
    }
  }

  on_byPlayer_refreshdebuff(event) {
    const spellId = event.ability.guid;
    if (!WILDFIRE_INFUSION_DOTS.includes(spellId) && spellId !== SPELLS.SERPENT_STING_SV.id) {
      return;
    }
    if (spellId === SPELLS.SERPENT_STING_SV.id) {
      this._serpentApplication(event);
    }
  }

  on_byPlayer_removedebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SERPENT_STING_SV.id) {
      return;
    }
    const encoded = encodeTargetString(event.targetID, event.targetInstance);
    delete this.activeSerpentStings[encoded];
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!WILDFIRE_INFUSION_IMPACT.includes(spellId) && !WILDFIRE_INFUSION_DOTS.includes(spellId)) {
      return;
    }
    if (WILDFIRE_INFUSION_IMPACT.includes(spellId)) {
      console.log('impact');
    }
    if (WILDFIRE_INFUSION_DOTS.includes(spellId)) {
      console.log('dots');
    }
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.WILDFIRE_INFUSION_TALENT.id}
        value={`memes`}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Cast at</th>
              <th>Damage</th>
              <th>Hits</th>
              <th>Avg hit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td> :)</td>
              <td> :)</td>
              <td> :)</td>
              <td> :)</td>
            </tr>
          </tbody>
        </table>
      </TalentStatisticBox>
    );
  }
}

export default WildfireInfusion;

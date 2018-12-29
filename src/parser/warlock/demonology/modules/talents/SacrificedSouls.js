import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import DemoPets from '../pets/DemoPets';

const BONUS_DAMAGE_PER_PET = 0.04;
const MAX_TRAVEL_TIME = 3000; // Shadow Bolt is the slowest, takes around 2 seconds to land from max distance, add a little more to account for target movement
const debug = false;
/*
  Sacrificed Souls:
    Shadow Bolt and Demonbolt deal 5% additional damage per demon you have summoned.
 */
class SacrificedSouls extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  _shadowBoltDamage = 0;
  _demonboltDamage = 0;
  _queue = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SACRIFICED_SOULS_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.SHADOW_BOLT_DEMO, SPELLS.DEMONBOLT]), this.handleCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.SHADOW_BOLT_DEMO, SPELLS.DEMONBOLT]), this.handleDamage);
  }

  // essentially same snapshotting mechanic as in Destruction's Eradication
  handleCast(event) {
    const bonus = this.demoPets.getPetCount() * BONUS_DAMAGE_PER_PET;
    this._queue.push({
      timestamp: event.timestamp,
      spellId: event.ability.guid,
      targetID: event.targetID,
      targetInstance: event.targetInstance,
      bonus,
    });
    debug && this.log('Pushed a cast into queue', JSON.parse(JSON.stringify(this._queue)));
  }

  handleDamage(event) {
    // filter out old casts if there are any
    this._queue = this._queue.filter(cast => cast.timestamp > (event.timestamp - MAX_TRAVEL_TIME));
    const castIndex = this._queue
      .findIndex(cast => cast.targetID === event.targetID
                      && cast.targetInstance === event.targetInstance
                      && cast.spellId === event.ability.guid);
    if (castIndex === -1) {
      debug && this.error('Encountered damage event with no cast associated. Queue', JSON.parse(JSON.stringify(this._queue)), 'event', event);
      return;
    }
    debug && this.log('Paired damage event', event, 'with queued cast', JSON.parse(JSON.stringify(this._queue[castIndex])));
    const bonusDamage = calculateEffectiveDamage(event, this._queue[castIndex].bonus);
    this._queue.splice(castIndex, 1);
    if (event.ability.guid === SPELLS.SHADOW_BOLT_DEMO.id) {
      this._shadowBoltDamage += bonusDamage;
    } else {
      this._demonboltDamage += bonusDamage;
    }
  }

  get totalBonusDamage() {
    return this._shadowBoltDamage + this._demonboltDamage;
  }

  subStatistic() {
    let powerSiphonTooltip = '';
    const hasPS = this.selectedCombatant.hasTalent(SPELLS.POWER_SIPHON_TALENT.id);
    if (hasPS) {
      powerSiphonTooltip = `<br /><br />* Since you have Power Siphon talent, it's highly likely that it messes up getting current pets at certain time because sometimes 
                            the number of Imps we sacrifice in code doesn't agree with what happens in logs. Therefore, this value is most likely a little wrong.`;
    }
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.SACRIFICED_SOULS_TALENT.id} /> bonus dmg</>}
        value={`${this.owner.formatItemDamageDone(this.totalBonusDamage)}${hasPS ? '*' : ''}`}
        valueTooltip={`${formatThousands(this.totalBonusDamage)} bonus damage<br />
                  Bonus Shadow Bolt damage: ${formatThousands(this._shadowBoltDamage)} (${this.owner.formatItemDamageDone(this._shadowBoltDamage)})<br />
                  Bonus Demonbolt damage: ${formatThousands(this._demonboltDamage)} (${this.owner.formatItemDamageDone(this._demonboltDamage)})
                  ${powerSiphonTooltip}`}
      />
    );
  }
}

export default SacrificedSouls;

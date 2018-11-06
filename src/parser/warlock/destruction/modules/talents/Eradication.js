import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatThousands } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

const MAX_TRAVEL_TIME = 3000; // Chaos Bolt being the slowest, takes around 2 seconds to land from max range, added a second to account for maybe target movement?
const ERADICATION_DAMAGE_BONUS = 0.1;
const debug = false;

/*
  Eradication - Chaos Bolt increases the damage you deal to the target by 10% for 7 sec
 */
class Eradication extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  _buffedCB = 0;
  _totalCB = 0;
  bonusDmg = 0;

  // queues spells CAST with target having Eradication (except DoTs)
  queue = [
    /*
    {
      timestamp
      spellId
      targetID
      targetInstance
    }
     */
  ];
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ERADICATION_TALENT.id);
  }

  on_byPlayer_cast(event) {
    // only queue spells with travel time
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.INCINERATE.id && spellId !== SPELLS.CHAOS_BOLT.id) {
      return;
    }

    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.ERADICATION_DEBUFF.id, event.timestamp)) {
      return;
    }
    this.queue.push({
      timestamp: event.timestamp,
      spellId: spellId,
      targetID: event.targetID,
      targetInstance: event.targetInstance,
    });
    debug && console.log('Pushed a buffed cast into queue', JSON.parse(JSON.stringify(this.queue)));
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.INCINERATE.id || spellId === SPELLS.CHAOS_BOLT.id) {
      this._handleTravelSpellDamage(event);
      return;
    }

    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.ERADICATION_DEBUFF.id, event.timestamp)) {
      return;
    }

    this.bonusDmg += calculateEffectiveDamage(event, ERADICATION_DAMAGE_BONUS);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.ERADICATION_DEBUFF.id) / this.owner.fightDuration;
  }

  get CBpercentage() {
    return (this._buffedCB / this._totalCB) || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.7,
        average: 0.65,
        major: 0.55,
      },
      style: 'percentage',
    };
  }

  _handleTravelSpellDamage(event) {
    if (event.ability.guid === SPELLS.CHAOS_BOLT.id) {
      this._totalCB += 1;
    }
    // first filter out old casts (could happen if player would cast something on a target and BEFORE it hits, it would die - then it couldn't be paired)
    this.queue = this.queue.filter(cast => cast.timestamp > (event.timestamp - MAX_TRAVEL_TIME));
    // try pairing damage event with casts in this.queue
    const castIndex = this.queue.findIndex(queuedCast => queuedCast.targetID === event.targetID
                                                  && queuedCast.targetInstance === event.targetInstance
                                                  && queuedCast.spellId === event.ability.guid);
    if (castIndex === -1) {
      debug && console.log(`(${this.owner.formatTimestamp(event.timestamp, 3)}) Encountered damage event with no buffed cast associated, queue:`, JSON.parse(JSON.stringify(this.queue)), 'event', event);
      return;
    }

    debug && console.log('Paired damage event', event, 'with queued cast', JSON.parse(JSON.stringify(this.queue[castIndex])));
    if (event.ability.guid === SPELLS.CHAOS_BOLT.id) {
      this._buffedCB += 1;
    }
    this.bonusDmg += calculateEffectiveDamage(event, ERADICATION_DAMAGE_BONUS);
    this.queue.splice(castIndex, 1);
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>Your uptime on the <SpellLink id={SPELLS.ERADICATION_DEBUFF.id} /> debuff could be improved. You should try to spread out your <SpellLink id={SPELLS.CHAOS_BOLT.id} /> casts more for higher uptime.<br /><small><em>NOTE:</em> Uptime may vary based on the encounter.</small></>)
          .icon(SPELLS.ERADICATION_TALENT.icon)
          .actual(`${formatPercentage(actual)}% Eradication uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  subStatistic() {
    return (
      <>
        <StatisticListBoxItem
          title={<><SpellLink id={SPELLS.ERADICATION_TALENT.id} /> uptime</>}
          value={`${formatPercentage(this.uptime)} %`}
          valueTooltip={`Bonus damage: ${formatThousands(this.bonusDmg)} (${this.owner.formatItemDamageDone(this.bonusDmg)}).`}
        />
        <StatisticListBoxItem
          title={<><SpellLink id={SPELLS.CHAOS_BOLT.id}>Chaos Bolts</SpellLink> buffed by <SpellLink id={SPELLS.ERADICATION_TALENT.id} /></>}
          value={`${formatPercentage(this.CBpercentage)} %`}
          valueTooltip={`${this._buffedCB} / ${this._totalCB} Chaos Bolts`}
        />
      </>
    );
  }
}

export default Eradication;

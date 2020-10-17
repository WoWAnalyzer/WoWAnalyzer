import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Events from 'parser/core/Events';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatThousands, formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

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
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.INCINERATE, SPELLS.CHAOS_BOLT]), this.onTravelSpellCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onTravelSpellCast(event) {
    const spellId = event.ability.guid;
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

  onDamage(event) {
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
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your uptime on the <SpellLink id={SPELLS.ERADICATION_DEBUFF.id} /> debuff could be improved. You should try to spread out your <SpellLink id={SPELLS.CHAOS_BOLT.id} /> casts more for higher uptime.<br /><small><em>NOTE:</em> Uptime may vary based on the encounter.</small></>)
          .icon(SPELLS.ERADICATION_TALENT.icon)
          .actual(i18n._(t('warlock.destruction.suggestions.eradication.uptime')`${formatPercentage(actual)}% Eradication uptime`))
          .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  get dps() {
    return this.bonusDmg / this.owner.fightDuration * 1000;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`Bonus damage: ${formatThousands(this.bonusDmg)}`}
      >
        <BoringSpellValueText spell={SPELLS.ERADICATION_TALENT}>
          {formatNumber(this.dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} % of total</small> <br />
          <UptimeIcon /> {formatPercentage(this.uptime, 0)} % <small>uptime</small> <br />
          {formatPercentage(this.CBpercentage, 0)} %
          <TooltipElement content={`${this._buffedCB} / ${this._totalCB} Chaos Bolts`}>
            <small>buffed Chaos Bolts <sup>*</sup></small>
          </TooltipElement>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Eradication;

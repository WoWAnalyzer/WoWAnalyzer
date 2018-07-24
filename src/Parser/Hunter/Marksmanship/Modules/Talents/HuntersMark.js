import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';
import Enemies from 'Parser/Core/Modules/Enemies';
import getDamageBonus from 'Parser/Core/calculateEffectiveDamage';
import StatisticBox from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';

/**
 * Apply Hunter's Mark to the target, increasing all damage you deal to the marked target by 5%.
 * If the target dies while affected by Hunter's Mark, you instantly gain 20 Focus.
 * The target can always be seen and tracked by the Hunter.
 *
 * Only one Hunter's Mark can be applied at a time.
 */

const HUNTERS_MARK_MODIFIER = 0.05;
const FOCUS_PER_REFUND = 20;
const MS_BUFFER = 100;

class HuntersMark extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  casts = 0;
  damage = 0;
  recasts = 0;
  refunds = 0;
  debuffRemoved = false;
  timeOfCast = 0;
  precastConfirmed = false;
  markWindow = [];
  damageToTarget = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HUNTERS_MARK_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HUNTERS_MARK_TALENT.id) {
      return;
    }
    this.casts++;
    this.timeOfCast = event.timestamp;
  }

  on_byPlayer_removedebuff(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.HUNTERS_MARK_TALENT.id) {
      return;
    }
    if (event.timestamp > this.timeOfCast + MS_BUFFER) {
      this.debuffRemoved = true;
    }
    const enemyID = encodeTargetString(event.targetID, event.targetInstance);
    if (this.precastConfirmed === false) {
      this.precastConfirmed = true;
      this.damage = this.damageToTarget[enemyID];
      return;
    }
    if (!this.markWindow[enemyID]) {
      return;
    }
    this.markWindow[enemyID].forEach(window => {
      if (window.status === "active") {
        window.status = "inactive";
      }
    });

  }

  on_byPlayer_applydebuff(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.HUNTERS_MARK_TALENT.id) {
      return;
    }
    if (!this.precastConfirmed) {
      this.precastConfirmed = true;
    }
    if (!this.debuffRemoved) {
      this.recasts++;
    }
    this.debuffRemoved = false;
    const enemyID = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.markWindow[enemyID]) {
      this.markWindow[enemyID] = [];
    }
    this.markWindow[enemyID].push({ status: "active", start: event.timestamp });
  }

  calculateMarkDamage(event, enemy) {
    if (!this.precastConfirmed) {
      if (!this.damageToTarget[enemy.id]) {
        this.damageToTarget[enemy.id] = 0;
      }
      this.damageToTarget[enemy.id] += getDamageBonus(event, HUNTERS_MARK_MODIFIER);
    }
    if (!this.markWindow[enemy.id]) {
      return;
    }
    this.markWindow[enemy.id].forEach(window => {
      if (window.start < event.timestamp && window.status === "active") {
        this.damage += getDamageBonus(event, HUNTERS_MARK_MODIFIER);
      }
    });
  }

  on_byPlayer_refreshdebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HUNTERS_MARK_TALENT.id) {
      return;
    }
    this.recasts++;
  }

  on_byPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HUNTERS_MARK_FOCUS.id) {
      return;
    }
    this.refunds++;
  }

  on_byPlayer_damage(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    this.calculateMarkDamage(event, enemy);
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.HUNTERS_MARK_TALENT.id) / this.owner.fightDuration;
  }

  get potentialPrecastConfirmation() {
    return this.refunds + this.recasts > this.casts ? '<li>We\'ve detected a possible precast, and there might be a discrepancy in amount of total casts versus amount of refunds and casts whilst debuff was active on another target.</li>' : '';
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HUNTERS_MARK_TALENT.id} />}
        value={`${formatPercentage(this.uptimePercentage)}%`}
        label="Hunters Mark uptime"
        tooltip={`<ul><li>You had a total of ${this.casts} casts of Hunter's Mark.</li><li>You cast Hunter's Mark ${this.recasts} times, whilst it was active on the target or another target.</li><li>You received up to ${this.refunds * FOCUS_PER_REFUND} focus from a total of ${this.refunds}refunds from targets with Hunter's Mark active dying.</li>${this.potentialPrecastConfirmation}</ul>`}
      />
    );
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.HUNTERS_MARK_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }
}

export default HuntersMark;

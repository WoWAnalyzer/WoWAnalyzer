import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'interface/ItemDamageDone';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { formatPercentage } from 'common/format';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';

/**
 * Apply Hunter's Mark to the target, increasing all damage you deal to the marked target by 5%.
 * If the target dies while affected by Hunter's Mark, you instantly gain 20 Focus.
 * The target can always be seen and tracked by the Hunter.
 *
 * Only one Hunter's Mark can be applied at a time.
 *
 * Example log: https://www.warcraftlogs.com/reports/v6nrtTxNKGDmYJXy#fight=16&type=auras&hostility=1&spells=debuffs&target=6
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
      if (window.status === 'active') {
        window.status = 'inactive';
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
    this.markWindow[enemyID].push({ status: 'active', start: event.timestamp });
  }

  calculateMarkDamage(event) {
    const enemyID = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.precastConfirmed) {
      if (!this.damageToTarget[enemyID]) {
        this.damageToTarget[enemyID] = 0;
      }
      this.damageToTarget[enemyID] += calculateEffectiveDamage(event, HUNTERS_MARK_MODIFIER);
    }
    if (!this.markWindow[enemyID]) {
      return;
    }
    this.markWindow[enemyID].forEach(window => {
      if (window.start < event.timestamp && window.status === 'active') {
        this.damage += calculateEffectiveDamage(event, HUNTERS_MARK_MODIFIER);
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
    this.calculateMarkDamage(event);
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.HUNTERS_MARK_TALENT.id) / this.owner.fightDuration;
  }

  get potentialPrecastConfirmation() {
    return (this.refunds + this.recasts) > this.casts ? <li>We've detected a possible precast, and there might be a discrepancy in amount of total casts versus amount of refunds and casts whilst debuff was active on another target.</li> : '';
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={'TALENTS'}
        tooltip={(
          <>
            <ul>
              <li>You had a total of {this.casts} casts of Hunter's Mark.</li>
              <li>You cast Hunter's Mark {this.recasts} times, whilst it was active on the target or another target.</li>
              <li>You received up to {this.refunds * FOCUS_PER_REFUND} Focus from a total of {this.refunds} refunds from targets with Hunter's Mark active dying.</li>
              {this.potentialPrecastConfirmation}
            </ul>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.HUNTERS_MARK_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /><br />
            <UptimeIcon /> {formatPercentage(this.uptimePercentage)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  /**
   * @deprecated
   * @returns {*}
   */
  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.HUNTERS_MARK_TALENT.id} />}
        value={<ItemDamageDone amount={this.damage} />}
      />
    );
  }
}

export default HuntersMark;

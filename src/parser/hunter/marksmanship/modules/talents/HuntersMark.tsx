import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { formatPercentage } from 'common/format';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import { ApplyDebuffEvent, CastEvent, DamageEvent, EnergizeEvent, RefreshDebuffEvent, RemoveDebuffEvent } from 'parser/core/Events';

/**
 * Apply Hunter's Mark to the target, increasing all damage you deal to the marked target by 5%.
 * If the target dies while affected by Hunter's Mark, you instantly gain 20 Focus.
 * The target can always be seen and tracked by the Hunter.
 *
 * Only one Hunter's Mark can be applied at a time.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/Rn9XxCYLm1q7KFNW#fight=3&type=damage-done&source=15&ability=212680
 */

const HUNTERS_MARK_MODIFIER = 0.05;
const FOCUS_PER_REFUND = 20;
const MS_BUFFER = 100;

class HuntersMark extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  casts = 0;
  damage = 0;
  recasts = 0;
  refunds = 0;
  debuffRemoved = false;
  timeOfCast = 0;
  precastConfirmed = false;
  markWindow: { [key: string]: { status: string; start: number } } = {};
  damageToTarget: { [key: string]: number } = {};
  enemyID: string = '';

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HUNTERS_MARK_TALENT.id);
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HUNTERS_MARK_TALENT.id) {
      return;
    }
    this.casts += 1;
    this.timeOfCast = event.timestamp;
  }

  on_byPlayer_removedebuff(event: RemoveDebuffEvent) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.HUNTERS_MARK_TALENT.id) {
      return;
    }
    if (event.timestamp > this.timeOfCast + MS_BUFFER) {
      this.debuffRemoved = true;
    }
    this.enemyID = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.precastConfirmed) {
      this.precastConfirmed = true;
      this.damage = this.damageToTarget[this.enemyID];
      return;
    }
    if (!this.markWindow[this.enemyID]) {
      return;
    }
    this.markWindow[this.enemyID].status = 'inactive';
  }

  on_byPlayer_applydebuff(event: ApplyDebuffEvent) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.HUNTERS_MARK_TALENT.id) {
      return;
    }
    if (!this.precastConfirmed) {
      this.precastConfirmed = true;
    }
    if (!this.debuffRemoved) {
      this.recasts += 1;
    }
    this.debuffRemoved = false;
    this.enemyID = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.markWindow[this.enemyID]) {
      this.markWindow[this.enemyID] = {
        status: '',
        start: 0,
      };
    }
    this.markWindow[this.enemyID].status = 'active';
    this.markWindow[this.enemyID].start = event.timestamp;
  }

  calculateMarkDamage(event: DamageEvent) {
    this.enemyID = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.precastConfirmed) {
      if (!this.damageToTarget[this.enemyID]) {
        this.damageToTarget[this.enemyID] = 0;
      }
      this.damageToTarget[this.enemyID] += calculateEffectiveDamage(event, HUNTERS_MARK_MODIFIER);
    }
    if (!this.markWindow[this.enemyID]) {
      return;
    }
    if (this.markWindow[this.enemyID].status === 'active' && this.markWindow[this.enemyID].start < event.timestamp) {
      this.damage += calculateEffectiveDamage(event, HUNTERS_MARK_MODIFIER);
    }
  }

  on_byPlayer_refreshdebuff(event: RefreshDebuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HUNTERS_MARK_TALENT.id) {
      return;
    }
    this.recasts += 1;
  }

  on_byPlayer_energize(event: EnergizeEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HUNTERS_MARK_FOCUS.id) {
      return;
    }
    this.refunds += 1;
  }

  on_byPlayer_damage(event: DamageEvent) {
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
            <ItemDamageDone amount={this.damage} />
            <br />
            <UptimeIcon /> {formatPercentage(this.uptimePercentage)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HuntersMark;

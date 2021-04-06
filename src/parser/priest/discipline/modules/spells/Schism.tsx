import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import DualStatisticBox from 'interface/others/DualStatisticBox';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

import Penance from './Penance';
import AtonementDamageSource from '../features/AtonementDamageSource';
import Atonement from './Atonement';
import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../core/AtonementAnalyzer';

class Schism extends Analyzer {
  protected enemies!: Enemies;
  protected atonementDamageSource!: AtonementDamageSource;

  static dependencies = {
    enemies: Enemies,
    atonementDamageSource: AtonementDamageSource,
  };

  static bonus = 0.25;

  private directDamage = 0;
  private damageFromBuff = 0;
  private healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SCHISM_TALENT.id);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtonement);
  }

  private onAtonement(event: AtonementAnalyzerEvent) {
    const { healEvent, damageEvent } = event;
    if (!damageEvent) return;
    const target = this.enemies.getEntity(damageEvent);
    if (!target?.hasBuff(SPELLS.SCHISM_TALENT.id)) return;

    // Schism isn't buffed by itself, so requires a different path
    if (damageEvent.ability.guid === SPELLS.SCHISM_TALENT.id) {
      this.healing += healEvent.amount;
    }

    this.healing += calculateEffectiveHealing(healEvent, Schism.bonus);
  }

  /**
   * Processes the passive damage added by Schism on a target
   * @param event The damage event being considered
   */
  private onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;
    const target = this.enemies.getEntity(event);

    if (spellId === SPELLS.SCHISM_TALENT.id) {
      this.directDamage += event.amount + (event.absorbed || 0);
      return;
    }
    if (target?.hasBuff(SPELLS.SCHISM_TALENT.id)) return;

    this.damageFromBuff += calculateEffectiveDamage(event, Schism.bonus);
  }

  statistic() {
    return (
      <DualStatisticBox
        icon={<SpellIcon id={SPELLS.SCHISM_TALENT.id} />}
        values={[
          `${formatNumber((this.healing / this.owner.fightDuration) * 1000)} HPS`,
          `${formatNumber(
            ((this.directDamage + this.damageFromBuff) / this.owner.fightDuration) * 1000,
          )} DPS`,
        ]}
        footer={
          <>
            <SpellLink id={SPELLS.SCHISM_TALENT.id} /> throughput
          </>
        }
        tooltip={
          <>
            The effective healing contributed by Schism was{' '}
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))}% of total
            healing done.
            <br />
            The direct damage contributed by the Schism talent was{' '}
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.directDamage))}% of
            total damage done.
            <br />
            The effective damage contributed by the Schism bonus was{' '}
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damageFromBuff))}% of
            total damage done. <br />
          </>
        }
        alignIcon="center"
      />
    );
  }
}

export default Schism;

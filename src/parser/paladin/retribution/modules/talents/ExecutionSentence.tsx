import React from 'react';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {DamageEvent} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Enemies from 'parser/shared/modules/Enemies';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Statistic from 'interface/statistics/Statistic';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';
import ItemDamageDone from 'interface/ItemDamageDone';
import { formatNumber } from 'common/format';

import { ABILITIES_AFFECTED_BY_HOLY_DAMAGE_INCREASES } from '../../constants';

const DAMAGE_BONUS = 0.2;

//TODO: Needs updating for Shadowlands

class ExecutionSentence extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;

  damageIncrease = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.EXECUTION_SENTENCE_TALENT.id);

    // event listeners
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_HOLY_DAMAGE_INCREASES), this.onAffectedDamage);
  }

  onAffectedDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    if (enemy.hasBuff(SPELLS.EXECUTION_SENTENCE_DEBUFF.id)) {
      this.damageIncrease += calculateEffectiveDamage(event, DAMAGE_BONUS);
    }
  }

  get directDamage() {
    return this.abilityTracker.getAbility(SPELLS.EXECUTION_SENTENCE_TALENT.id).damageEffective;
  }

  get directDps() {
    return this.directDamage / this.owner.fightDuration * 1000;
  }

  get indirectDps() {
    return this.damageIncrease / this.owner.fightDuration * 1000;
  }

  get totalDamage() {
    return this.damageIncrease + this.directDamage;
  }

  get totalDps() {
    return this.totalDamage / this.owner.fightDuration * 1000;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        tooltip={(
          <>
            Total damage contributed: {formatNumber(this.totalDamage)} <br />
            DPS from Execution Sentence's direct damage: {formatNumber(this.directDps)} <br />
            DPS gained from Execution Sentence's debuff: {formatNumber(this.indirectDps)}
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.EXECUTION_SENTENCE_TALENT}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ExecutionSentence;

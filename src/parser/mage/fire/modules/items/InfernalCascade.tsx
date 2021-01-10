import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import ConduitSpellText from 'interface/statistics/components/ConduitSpellText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const DAMAGE_BONUS = [0, .09, .099, .108, .117, .126, .135, .144, .153, .162, .171, .18, .189, .198, .207, .216];

class InfernalCascade extends Analyzer {
  
  conduitRank = 0;
  bonusDamage = 0;
  buffStack = 0;
  totalBuffs = 0;
  combustionCount = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.INFERNAL_CASCADE.id);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.INFERNAL_CASCADE.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INFERNAL_CASCADE_BUFF), this.onBuffStack);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.INFERNAL_CASCADE_BUFF), this.onBuffStack);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION), this.onCombustionStart);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION), this.onCombustionEnd);
  }

  onDamage(event: DamageEvent) {
    const buff = this.selectedCombatant.getBuff(SPELLS.INFERNAL_CASCADE_BUFF.id);
    if (!buff || !this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id)) {
      return;
    }
    this.bonusDamage += calculateEffectiveDamage(event,DAMAGE_BONUS[this.conduitRank] * buff.stacks);
  }
  onBuffStack() {
    const buff = this.selectedCombatant.getBuff(SPELLS.INFERNAL_CASCADE_BUFF.id);
    if (buff && buff.stacks > this.buffStack) {
      this.buffStack = buff.stacks;
    }
  }
  onCombustionStart() {
    this.combustionCount += 1;
  }
  onCombustionEnd() {
    this.totalBuffs += this.buffStack;
    this.buffStack = 0;
  }

  get averageBuffStack() {
    return this.totalBuffs / this.combustionCount;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.COVENANTS}
        size="flexible"
      >
        <ConduitSpellText spell={SPELLS.INFERNAL_CASCADE} rank={this.conduitRank}>
          <ItemDamageDone amount={this.bonusDamage} /><br />
          {this.averageBuffStack} <small>Avg. stacks per Combustion</small>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default InfernalCascade;

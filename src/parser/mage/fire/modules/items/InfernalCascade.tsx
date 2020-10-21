import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

export const DAMAGE_BONUS: {[rank: number]: number } = {
  1: .03,
  2: .035,
  3: .04,
  4: .045,
  5: .05,
  6: .055,
  7: .06,
  8: .065,
  9: .07,
  10: .075,
  11: .08,
  12: .085,
  13: .09,
  14: .095,
  15: .1,
};

class InfernalCascade extends Analyzer {
  conduitRank: number = 0;

  bonusDamage = 0;
  buffStack = 0;
  totalBuffs = 0;
  combustionCount = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.INFERNAL_CASCADE.id);
    if (!this.active) {
      return;
    }
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
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.INFERNAL_CASCADE}>
          <ItemDamageDone amount={this.bonusDamage} /><br />
          {this.averageBuffStack} <small>Avg. stacks per Combustion</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default InfernalCascade;

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import React from 'react';
import ItemHealingDone from 'interface/others/ItemHealingDone';

const GUARDIAN_SPIRIT_HEALING_MULTIPLIER = .4;

// Example Log: /report/mFarpncVW9ALwTq4/7-Mythic+Zek'voz+-+Kill+(8:52)/14-Praydien
class GuardianAngel extends Analyzer {
  guardianSpiritCasts = 0;
  guardianSpiritRemovals = 0;
  guardianSpiritHeals = 0;
  guardianSpiritHealing = 0;
  guardianSpiritBonusHealingFromSelf = 0;
  guardianSpiritBonusHealingFromOther = 0;

  spiritedTarget = null;

  get guardianSpiritRefreshes() {
    return this.guardianSpiritRemovals - this.guardianSpiritHeals;
  }

  get guardianSpiritSelfHealing() {
    return this.guardianSpiritHealing + this.guardianSpiritBonusHealingFromSelf;
  }

  get guardianSpiritEffectiveHealing() {
    return this.guardianSpiritHealing + this.guardianSpiritBonusHealingFromSelf + this.guardianSpiritBonusHealingFromOther;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GUARDIAN_ANGEL_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.GUARDIAN_SPIRIT.id) {
      this.guardianSpiritCasts++;
      this.spiritedTarget = event.targetID;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.GUARDIAN_SPIRIT.id) {
      this.guardianSpiritRemovals++;
      this.spiritedTarget = null;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.GUARDIAN_SPIRIT_HEAL.id) {
      this.guardianSpiritHeals++;
      this.guardianSpiritHealing += event.amount || 0;
    }

    if (this.spiritedTarget != null) {
      // TODO: This is not accurate, but it's close enough for now.
      this.guardianSpiritBonusHealingFromSelf += event.amount * GUARDIAN_SPIRIT_HEALING_MULTIPLIER;
    }
  }

  statistic() {
    return (

      <TalentStatisticBox
        talent={SPELLS.GUARDIAN_ANGEL_TALENT.id}
        value={(
          <ItemHealingDone amount={this.guardianSpiritSelfHealing} />
        )}
        tooltip={`
          Total Guardian Spirits Cast: ${this.guardianSpiritCasts}<br />
          Total Guardian Spirit Resets: ${this.guardianSpiritRefreshes}
        `}
        position={STATISTIC_ORDER.CORE(3)}
      />

    );
  }
}

export default GuardianAngel;

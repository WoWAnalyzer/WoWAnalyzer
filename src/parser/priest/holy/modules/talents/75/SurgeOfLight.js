import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import React from 'react';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import ItemManaGained from 'interface/others/ItemManaGained';

// Example Log: /report/hRd3mpK1yTQ2tDJM/1-Mythic+MOTHER+-+Kill+(2:24)/14-丶寶寶小喵
class SurgeOfLight extends Analyzer {
  solStacksGained = 0;
  solStacksLost = 0;
  solFlashHeals = 0;
  currentSolStacks = 0;

  solHealing = 0;
  solOverHealing = 0;

  freeFlashHealPending = false;

  get solManaSaved() {
    return this.solFlashHeals * SPELLS.FLASH_HEAL.manaCost;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SURGE_OF_LIGHT_TALENT.id);
  }

  on_byPlayer_changebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SURGE_OF_LIGHT_BUFF.id) {
      if (event.stacksGained > 0) {
        this.solStacksGained += 1;
      } else {
        this.freeFlashHealPending = true;
        this.solStacksSpent += 1;
      }
      this.currentSolStacks = event.newStacks;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.FLASH_HEAL.id && this.freeFlashHealPending) {
      this.solFlashHeals++;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.FLASH_HEAL.id && this.freeFlashHealPending) {
      this.solHealing += event.amount || 0;
      this.solOverHealing += event.overhealing || 0;
      if (this.currentSolStacks === 0) {
        this.freeFlashHealPending = false;
      }
    }
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.SURGE_OF_LIGHT_TALENT.id}
        value={<>
          <ItemHealingDone amount={this.solHealing} /><br />
          <ItemManaGained amount={this.solManaSaved} />
        </>}
        tooltip={`Free Flash Heals: ${this.solFlashHeals}`}
        position={STATISTIC_ORDER.CORE(5)}
      />
    );
  }
}

export default SurgeOfLight;

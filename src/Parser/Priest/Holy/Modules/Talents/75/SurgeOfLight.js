import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TalentStatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';

// Example Log: /report/hRd3mpK1yTQ2tDJM/1-Mythic+MOTHER+-+Kill+(2:24)/14-丶寶寶小喵
class SurgeOfLight extends Analyzer {
  solStacksGained = 0;
  solStacksLost = 0;
  solFlashHeals = 0;
  currentSolStacks = 0;

  solHealing = 0;
  solOverHealing = 0;

  freeFlashHealPending = false;

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
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.SURGE_OF_LIGHT_TALENT.id} />}
        value={(
          <ItemHealingDone amount={this.solHealing} />
        )}
        tooltip={`${this.solFlashHeals} free Flash Heals`}
        label="Surge of Light"
        position={STATISTIC_ORDER.CORE(5)}
      />

    );
  }
}

export default SurgeOfLight;

import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

import SpellUsable from 'parser/shared/modules/SpellUsable';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';

/**
 * Hurls a Steel Trap to the target location that snaps shut on the
 * first enemy that approaches, immobilizing them for 20 sec and
 * causing them to bleed for (120% of Attack power) damage over 20 sec.
 *
 * Example log: https://www.warcraftlogs.com/reports/dZ8AJaYvj23qG4WB#fight=16&type=damage-done&source=9
 */

class SteelTrap extends Analyzer {

  static dependencies = {
    spellUsable: SpellUsable,
  };

  damage = 0;
  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STEEL_TRAP_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STEEL_TRAP_TALENT.id) {
      return;
    }
    this.casts++;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STEEL_TRAP_DEBUFF.id) {
      return;
    }
    if (this.casts === 0) {
      this.casts += 1;
      this.spellUsable.beginCooldown(SPELLS.STEEL_TRAP_TALENT.id, this.owner.fight.start_time);
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.STEEL_TRAP_TALENT.id}
        value={<ItemDamageDone amount={this.damage} />}
      />
    );
  }
}

export default SteelTrap;

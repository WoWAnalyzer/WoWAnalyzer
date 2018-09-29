import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

import SpellUsable from 'parser/core/modules/SpellUsable';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

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

  bonusDamage = 0;
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
      this.casts++;
      this.spellUsable.beginCooldown(SPELLS.STEEL_TRAP_TALENT.id, this.owner.fight.start_time);
    }
    this.bonusDamage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.STEEL_TRAP_TALENT.id} />}
        value={<ItemDamageDone amount={this.bonusDamage} />}
      />
    );
  }
}

export default SteelTrap;

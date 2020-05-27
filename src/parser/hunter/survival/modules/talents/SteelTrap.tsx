import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

import SpellUsable from 'parser/shared/modules/SpellUsable';
import ItemDamageDone from 'interface/ItemDamageDone';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { CastEvent, DamageEvent } from 'parser/core/Events';

/**
 * Hurls a Steel Trap to the target location that snaps shut on the
 * first enemy that approaches, immobilizing them for 20 sec and
 * causing them to bleed for (120% of Attack power) damage over 20 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/K8chFdJvxfywkPRG#fight=92&type=damage-done&source=988&translate=true&ability=162487
 */

class SteelTrap extends Analyzer {

  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  damage = 0;
  casts = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STEEL_TRAP_TALENT.id);
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STEEL_TRAP_TALENT.id) {
      return;
    }
    this.casts += 1;
  }

  on_byPlayer_damage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STEEL_TRAP_DEBUFF.id) {
      return;
    }
    if (this.casts === 0) {
      this.casts += 1;
      this.spellUsable.beginCooldown(SPELLS.STEEL_TRAP_TALENT.id, { timestamp: this.owner.fight.start_time });
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        category={'TALENTS'}
      >
        <BoringSpellValueText spell={SPELLS.STEEL_TRAP_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SteelTrap;

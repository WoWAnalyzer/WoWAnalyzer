import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

/*
  example report: https://www.warcraftlogs.com/reports/3DFqkLhgRMB9wHQ7/#fight=33&source=16
 */

const DAMAGE_SPELLS = [
  SPELLS.CHAOS_STRIKE_MH_DAMAGE,
  SPELLS.CHAOS_STRIKE_OH_DAMAGE,
  SPELLS.ANNIHILATION_MH_DAMAGE,
  SPELLS.ANNIHILATION_OH_DAMAGE,
];
const DAMAGE_INCREASE = 0.4;

class DarkSlash extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  extraDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DARK_SLASH_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(DAMAGE_SPELLS), this.damage);
  }

  damage(event) {
    const target = this.enemies.getEntity(event);
    if (!target) {
      return;
    }
    const hasDarkSlashDebuff = target.hasBuff(SPELLS.DARK_SLASH_TALENT.id, event.timestamp);

    if (hasDarkSlashDebuff) {
      this.extraDamage += calculateEffectiveDamage(event, DAMAGE_INCREASE);
    }
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.DARK_SLASH_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(6)}
        value={this.owner.formatItemDamageDone(this.extraDamage)}
        tooltip={`${formatThousands(this.extraDamage)} total damage`}
      />
    );
  }
}

export default DarkSlash;

import React from 'react';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import StatTracker from 'parser/shared/modules/StatTracker';

import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES } from '../../constants';

const CRIT_BONUS = 0.5;

class MasterAssassin extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  bonusDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MASTER_ASSASSIN_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_DAMAGE_INCREASES), this.addBonusDamageIfBuffed);
  }

  addBonusDamageIfBuffed(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.STEALTH.id) && !this.selectedCombatant.hasBuff(SPELLS.MASTER_ASSASSIN_BUFF.id)) {
      return;
    }
    const critChance = this.statTracker.currentCritPercentage;
    const critBonusFromMasterAssassin = Math.min(CRIT_BONUS, 1 - critChance);
    const damageBonus = critBonusFromMasterAssassin / (1 + critBonusFromMasterAssassin + critChance);
    this.bonusDamage += calculateEffectiveDamage(event, damageBonus);
  }

  statistic() {
    return (
      <TalentStatisticBox
        position={STATISTIC_ORDER.OPTIONAL(2)}
        icon={<SpellIcon id={SPELLS.MASTER_ASSASSIN_TALENT.id} />}
        value={<ItemDamageDone amount={this.bonusDamage} />}
        label="Master Assassin"
      />
    );
  }

}

export default MasterAssassin;
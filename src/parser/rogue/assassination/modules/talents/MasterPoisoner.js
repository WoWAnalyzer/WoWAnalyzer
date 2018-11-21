import React from 'react';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import { ABILITIES_AFFECTED_BY_POISON_DAMAGE_INCREASES } from '../../constants';

const DAMAGE_BONUS = 0.3;

class MasterPoisoner extends Analyzer {

  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MASTER_POISONER_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_POISON_DAMAGE_INCREASES), this.addBonusDamage);
  }

  addBonusDamage(event) {
    this.bonusDmg += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.MASTER_POISONER_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(1)}
        value={<ItemDamageDone amount={this.bonusDmg} />}
      />
    );
  }

}

export default MasterPoisoner;

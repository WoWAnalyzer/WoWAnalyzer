import React from 'react';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES, NIGHTSTALKER_BLACKLIST } from '../../constants';
import GarroteSnapshot from '../features/GarroteSnapshot';
import RuptureSnapshot from '../features/RuptureSnapshot';

const DAMAGE_BONUS = 0.5;

class Nightstalker extends Analyzer {
  static dependencies = {
    garroteSnapshot: GarroteSnapshot,
    ruptureSnapshot: RuptureSnapshot,
  };

  bonusDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.NIGHTSTALKER_TALENT.id);
    if (!this.active) {
      return;
    }
    const allowedAbilities = ABILITIES_AFFECTED_BY_DAMAGE_INCREASES.filter(spell => !NIGHTSTALKER_BLACKLIST.includes(spell));
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(allowedAbilities), this.addBonusDamageIfBuffed);
  }

  addBonusDamageIfBuffed(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.STEALTH.id) && !this.selectedCombatant.hasBuff(SPELLS.VANISH_BUFF.id)) {
      return;
    }
    this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  get bonusDamageTotal() {
    return this.bonusDamage + this.garroteSnapshot.bonusDamage + this.ruptureSnapshot.bonusDamage;
  }

  statistic() {
    return (
      <TalentStatisticBox
        position={STATISTIC_ORDER.OPTIONAL(2)}
        icon={<SpellIcon id={SPELLS.NIGHTSTALKER_TALENT.id} />}
        value={<ItemDamageDone amount={this.bonusDamageTotal} />}
        label="Nightstalker"
      />
    );
  }

}

export default Nightstalker;
import React from 'react';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES, ABILITIES_AFFECTED_BY_SNAPSHOTTING } from '../../constants';
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
  }

  on_byPlayer_damage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.STEALTH.id)) {
      return;
    }
    const spellId = event.ability.guid;
    if (!ABILITIES_AFFECTED_BY_DAMAGE_INCREASES.includes(spellId)) {
      return;
    }
    if (ABILITIES_AFFECTED_BY_SNAPSHOTTING.includes(spellId)) {
      return;
    }
    this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  get bonusDamageFromSnapshot() {
    return this.bonusDamage + this.garroteSnapshot.bonusDamage + this.ruptureSnapshot.bonusDamage;
  }

  get bonusDamageTotal() {
    return this.bonusDamage + this.bonusDamageFromSnapshot;
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
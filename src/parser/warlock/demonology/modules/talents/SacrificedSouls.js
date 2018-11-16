import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatThousands } from 'common/format';

import StatisticBox from 'interface/others/StatisticBox';

import DemoPets from '../pets/DemoPets';

const BONUS_DAMAGE_PER_PET = 0.05;
/*
  Sacrificed Souls:
    Shadow Bolt and Demonbolt deal 5% additional damage per demon you have summoned.
 */
class SacrificedSouls extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  _shadowBoltDamage = 0;
  _demonboltDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SACRIFICED_SOULS_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.SHADOW_BOLT_DEMO, SPELLS.DEMONBOLT]), this.handleDamage);
  }

  // TODO: rework into on cast snapshotting if necessary
  handleDamage(event) {
    const bonus = this.demoPets.getPetCount() * BONUS_DAMAGE_PER_PET;
    const bonusDamage = calculateEffectiveDamage(event, bonus);
    if (event.ability.guid === SPELLS.SHADOW_BOLT_DEMO.id) {
      this._shadowBoltDamage += bonusDamage;
    } else {
      this._demonboltDamage += bonusDamage;
    }
  }

  get totalBonusDamage() {
    return this._shadowBoltDamage + this._demonboltDamage;
  }

  statistic() {
    let powerSiphonTooltip = '';
    const hasPS = this.selectedCombatant.hasTalent(SPELLS.POWER_SIPHON_TALENT.id);
    if (hasPS) {
      powerSiphonTooltip = `<br /><br />* Since you have Power Siphon talent, it's highly likely that it messes up getting current pets at certain time because sometimes 
                            the number of Imps we sacrifice in code doesn't agree with what happens in logs. Therefore, this value is most likely a little wrong.`;
    }
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SACRIFICED_SOULS_TALENT.id} />}
        value={`${formatThousands(this.totalBonusDamage)}${hasPS ? '*' : ''}`}
        label="Bonus damage from Sacrificed Souls"
        tooltip={`${this.owner.formatItemDamageDone(this.totalBonusDamage)}<br />
                  Bonus Shadow Bolt damage: ${formatThousands(this._shadowBoltDamage)}<br />
                  Bonus Demonbolt damage: ${formatThousands(this._demonboltDamage)}
                  ${powerSiphonTooltip}`}
      />
    );
  }
}

export default SacrificedSouls;

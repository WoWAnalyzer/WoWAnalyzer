import React from 'react';

import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';

import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

import DemoPets from '../pets/DemoPets';
import { isWildImp } from '../pets/helpers';

const DAMAGE_BONUS_PER_ENERGY = 0.005; // 0.5% per point of energy
const debug = false;

class DemonicConsumption extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  _currentBonus = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DEMONIC_CONSUMPTION_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_DEMONIC_TYRANT), this.handleCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.DEMONIC_TYRANT_DAMAGE), this.handleDemonicTyrantDamage);
  }

  handleCast() {
    const imps = this.demoPets.currentPets.filter(pet => isWildImp(pet.guid) && !pet.shouldImplode);
    debug && this.log('Imps on Tyrant cast', JSON.parse(JSON.stringify(imps)));
    this._currentBonus = imps.map(imp => imp.currentEnergy).reduce((total, current) => total + current, 0) * DAMAGE_BONUS_PER_ENERGY;
    debug && this.log('Current bonus: ', this._currentBonus);
  }

  handleDemonicTyrantDamage(event) {
    this.damage += calculateEffectiveDamage(event, this._currentBonus);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(this.damage)} damage`}
      >
        <BoringSpellValueText spell={SPELLS.DEMONIC_CONSUMPTION_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DemonicConsumption;

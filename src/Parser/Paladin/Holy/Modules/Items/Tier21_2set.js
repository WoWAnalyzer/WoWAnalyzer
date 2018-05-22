import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

import { BEACON_TYPES, BASE_BEACON_TRANSFER, BEACON_OF_FAITH_TRANSFER_REDUCTION } from '../../Constants';

const T21_2SET_BEACON_TRANSFER_INCREASE = 0.4;
const T21_2SET_AFFECTED_HEALS = [
  SPELLS.FLASH_OF_LIGHT.id,
  SPELLS.HOLY_LIGHT.id,
];

/**
 * 2 pieces (Holy) : Flash of Light and Holy Light transfer 40% additional healing to your Beacon of Light target.
 */
class Tier21_2set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HOLY_PALADIN_T21_2SET_BONUS_BUFF.id);
  }

  on_beacon_heal(event) {
    if (!this.isApplicable(event.originalHeal)) {
      return;
    }
    const baseBeaconTransferFactor = this.getBaseBeaconTransferFactor(event.originalHeal);
    const setBonusBeaconTransferFactor = this.getSetBonusBeaconTransferFactor(event.originalHeal);

    const totalBeaconTransferFactor = baseBeaconTransferFactor + setBonusBeaconTransferFactor;
    const lightsEmbraceBeaconTransferHealingIncrease = setBonusBeaconTransferFactor / totalBeaconTransferFactor;

    const effectiveHealing = calculateEffectiveHealing(event, lightsEmbraceBeaconTransferHealingIncrease);

    this.healing += effectiveHealing;
  }

  isApplicable(event) {
    const spellId = event.ability.guid;
    if (!T21_2SET_AFFECTED_HEALS.includes(spellId)) {
      return false;
    }
    return true;
  }

  getBaseBeaconTransferFactor(originalHeal) {
    let beaconFactor = BASE_BEACON_TRANSFER;

    if (this.beaconType === BEACON_TYPES.BEACON_OF_FATH) {
      beaconFactor *= (1 - BEACON_OF_FAITH_TRANSFER_REDUCTION);
    }

    return beaconFactor;
  }
  getSetBonusBeaconTransferFactor(healEvent) {
    let beaconTransferFactor = 0;
    beaconTransferFactor += T21_2SET_BEACON_TRANSFER_INCREASE;
    if (this.beaconType === BEACON_TYPES.BEACON_OF_FATH) {
      beaconTransferFactor *= (1 - BEACON_OF_FAITH_TRANSFER_REDUCTION);
    }
    return beaconTransferFactor;
  }

  item() {
    return {
      id: `spell-${SPELLS.HOLY_PALADIN_T21_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.HOLY_PALADIN_T21_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.HOLY_PALADIN_T21_2SET_BONUS_BUFF.id} icon={false} />,
      result: <ItemHealingDone amount={this.healing} />,
    };
  }
}

export default Tier21_2set;

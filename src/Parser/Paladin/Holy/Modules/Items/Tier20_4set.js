import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

import { BEACON_TYPES, BASE_BEACON_TRANSFER, BEACON_OF_FAITH_TRANSFER_REDUCTION } from '../../Constants';

import LightOfDawn from '../PaladinCore/LightOfDawn';

const LIGHTS_EMBRACE_BEACON_HEAL_INCREASE = 0.4;

/**
 * 4 pieces (Holy) : For 5 sec after casting Light of Dawn, your healing spells will transfer an additional 40% to your Beacon of Light target.
 */
class Tier20_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    lightOfDawn: LightOfDawn,
  };

  healing = 0;
  totalBeaconHealingDuringLightsEmbrace = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HOLY_PALADIN_T20_4SET_BONUS_BUFF.id);
  }

  on_beacon_heal(beaconTransferEvent, healEvent) {
    const baseBeaconTransferFactor = this.getBaseBeaconTransferFactor(healEvent);
    const lightsEmbraceBeaconTransferFactor = this.getLightsEmbraceBeaconTransferFactor(healEvent);
    if (lightsEmbraceBeaconTransferFactor === 0) {
      return;
    }
    const totalBeaconTransferFactor = baseBeaconTransferFactor + lightsEmbraceBeaconTransferFactor;
    const lightsEmbraceBeaconTransferHealingIncrease = lightsEmbraceBeaconTransferFactor / totalBeaconTransferFactor;

    const effectiveHealing = calculateEffectiveHealing(beaconTransferEvent, lightsEmbraceBeaconTransferHealingIncrease);

    this.healing += effectiveHealing;
    this.totalBeaconHealingDuringLightsEmbrace += beaconTransferEvent.amount + (beaconTransferEvent.absorbed || 0) + (beaconTransferEvent.overheal || 0);
  }

  getBaseBeaconTransferFactor(healEvent) {
    let beaconFactor = BASE_BEACON_TRANSFER;

    if (this.beaconType === BEACON_TYPES.BEACON_OF_FATH) {
      beaconFactor *= (1 - BEACON_OF_FAITH_TRANSFER_REDUCTION);
    }

    return beaconFactor;
  }
  getLightsEmbraceBeaconTransferFactor(healEvent) {
    let beaconTransferFactor = 0;
    // What happens here are 2 situations:
    // - Light of Dawn applies Light's Embrace, it acts a bit weird though since the FIRST heal from the cast does NOT get the increased beacon transfer, while all sebsequent heals do (even when the combatlog has't fired the Light's Embrace applybuff event yet). The first part checks for that. The combatlog looks different when the first heal is a self heal vs they're all on other people, but in both cases it always doesn't apply to the first LoD heal and does for all subsequent ones.
    // - If a FoL or something else is cast right before the LoD, the beacon transfer may be delayed until after the Light's Embrace is applied. This beacon transfer does not appear to benefit. My hypothesis is that the server does healing and buffs async and there's a small lag between the processes, and I think 100ms should be about the time required.
    const hasLightsEmbrace = (healEvent.ability.guid === SPELLS.LIGHT_OF_DAWN_HEAL.id && healEvent.lightOfDawnHealIndex > 0) || this.combatants.selected.hasBuff(SPELLS.LIGHTS_EMBRACE_BUFF.id, null, 0, 100);
    if (hasLightsEmbrace) {
      beaconTransferFactor += LIGHTS_EMBRACE_BEACON_HEAL_INCREASE;
    }
    if (this.beaconType === BEACON_TYPES.BEACON_OF_FATH) {
      beaconTransferFactor *= (1 - BEACON_OF_FAITH_TRANSFER_REDUCTION);
    }
    // console.log(hasLightsEmbrace, healEvent.ability.name, healEvent, '-', (healEvent.timestamp - this.owner.fight.start_time) / 1000, 'seconds into the fight');

    return beaconTransferFactor;
  }

  item() {
    return {
      id: `spell-${SPELLS.HOLY_PALADIN_T20_4SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.HOLY_PALADIN_T20_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.HOLY_PALADIN_T20_4SET_BONUS_BUFF.id} />,
      result: (
        <dfn data-tip={`The actual effective healing contributed by the tier 20 4 set bonus. A total of ${formatNumber(this.totalBeaconHealingDuringLightsEmbrace)} <span style="color:orange">raw</span> healing was done on beacons during the Light's Embrace buff.`}>
          <ItemHealingDone amount={this.healing} />
        </dfn>
      ),
    };
  }
}

export default Tier20_4set;

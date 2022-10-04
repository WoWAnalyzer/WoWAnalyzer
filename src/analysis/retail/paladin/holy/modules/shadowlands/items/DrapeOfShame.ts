import SPELLS from 'common/SPELLS';
import Events, { BeaconHealEvent, HealEvent } from 'parser/core/Events';
import {
  DrapeOfShame as BaseDrapeOfShame,
  DRAPE_OF_SHAME_CRIT_EFFECT,
} from 'parser/retail/modules/items/DrapeOfShame';

import { getBeaconSpellFactor } from '../../../constants';
import BeaconHealSource from '../../beacons/BeaconHealSource';

export class DrapeOfShame extends BaseDrapeOfShame {
  static dependencies = {
    ...BaseDrapeOfShame.dependencies,
    // We use its "beacontransfer" event
    beaconHealSource: BeaconHealSource,
  };

  protected beaconHealSource!: BeaconHealSource;

  constructor(...args: ConstructorParameters<typeof BaseDrapeOfShame>) {
    super(...args);
    this.addEventListener(Events.beacontransfer, this.onBeaconTransfer);
  }

  onHeal = (event: HealEvent) => {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BEACON_OF_LIGHT_HEAL.id) {
      return;
    }
    super.onHeal(event);
  };

  onBeaconTransfer = (event: BeaconHealEvent) => {
    if (!this.isApplicableHeal(event.originalHeal)) {
      return;
    }
    const spellId = event.originalHeal.ability.guid;
    if (spellId === SPELLS.BEACON_OF_LIGHT_HEAL.id) {
      return;
    }

    const contribution = this.critEffectBonus.getHealingContribution(
      event.originalHeal,
      DRAPE_OF_SHAME_CRIT_EFFECT,
    );
    const beaconFactor = getBeaconSpellFactor(spellId, this.selectedCombatant);
    if (beaconFactor == null) {
      const origAbility = event.originalHeal.ability;
      console.warn(
        `DrapeOfShame encountered a BeaconHealEvent triggered by ` +
          `${origAbility.name} (${origAbility.guid}) with no beacon spell factor configured`,
      );
      return;
    }

    const beaconRawContribution =
      (contribution.effectiveHealing + contribution.overhealing) * beaconFactor;
    const beaconEffectiveHealing = Math.max(0, beaconRawContribution - (event.overheal || 0));

    this.effectiveHealing += beaconEffectiveHealing;
    this.overhealing += beaconRawContribution - beaconEffectiveHealing;
  };
}

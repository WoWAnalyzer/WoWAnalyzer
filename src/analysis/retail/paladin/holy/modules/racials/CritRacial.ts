import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import Events, { BeaconHealEvent, HealEvent } from 'parser/core/Events';
import BaseCritRacial, { CRIT_EFFECT } from 'parser/shared/modules/racials/CritRacial';

import { getBeaconSpellFactor } from '../../constants';
import BeaconHealSource from '../beacons/BeaconHealSource';

class CritRacial extends BaseCritRacial {
  static dependencies = {
    ...BaseCritRacial.dependencies,
    // We use its "beacontransfer" event
    beaconHealSource: BeaconHealSource,
  };

  protected beaconHealSource!: BeaconHealSource;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.beacontransfer, this.onBeaconTransfer);
  }

  onHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BEACON_OF_LIGHT_HEAL.id) {
      return;
    }
    super.onHeal(event);
  }
  onBeaconTransfer(event: BeaconHealEvent) {
    if (!this.isApplicableHeal(event.originalHeal)) {
      return;
    }
    const spellId = event.originalHeal.ability.guid;
    if (spellId === SPELLS.BEACON_OF_LIGHT_HEAL.id) {
      return;
    }

    const contribution = this.critEffectBonus.getHealingContribution(
      event.originalHeal,
      CRIT_EFFECT,
    );
    const beaconFactor = getBeaconSpellFactor(spellId, this.selectedCombatant);
    if (beaconFactor == null) {
      const origAbility = event.originalHeal.ability;
      console.warn(
        `CritRacial encountered a BeaconHealEvent triggered by ` +
          `${origAbility.name} (${origAbility.guid}) with no beacon spell factor configured`,
      );
      return;
    }

    const beaconRawContribution =
      (contribution.effectiveHealing + contribution.overhealing) * beaconFactor;
    const beaconEffectiveHealing = Math.max(0, beaconRawContribution - (event.overheal || 0));

    this.healing += beaconEffectiveHealing;
    this.overhealing += beaconRawContribution - beaconEffectiveHealing;
  }
}

export default CritRacial;

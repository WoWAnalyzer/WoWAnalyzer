import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import Events, { BeaconHealEvent, HealEvent } from 'parser/core/Events';
import BaseMightOfTheMountain, {
  CRIT_EFFECT,
} from 'parser/shared/modules/racials/dwarf/MightOfTheMountain';

import BeaconHealSource from '../beacons/BeaconHealSource';

class MightOfTheMountain extends BaseMightOfTheMountain {
  static dependencies = {
    ...BaseMightOfTheMountain.dependencies,
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

    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    const overheal = event.overheal || 0;
    const raw = amount + absorbed + overheal;
    const rawNormalPart = raw / this.critEffectBonus.getBonus(event.originalHeal);
    const rawDrapeHealing = rawNormalPart * CRIT_EFFECT;

    const effectiveHealing = Math.max(0, rawDrapeHealing - overheal);

    this.healing += effectiveHealing;
  }
}

export default MightOfTheMountain;

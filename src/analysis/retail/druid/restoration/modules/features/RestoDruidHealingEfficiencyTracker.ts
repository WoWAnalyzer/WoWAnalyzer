import SPELLS from 'common/SPELLS';
import HealingEfficiencyTracker, {
  SpellInfoDetails,
} from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';

import HotAttributor from '../../modules/core/hottracking/HotAttributor';
import Abilities from '../Abilities';
import RegrowthAndClearcasting from 'analysis/retail/druid/restoration/modules/spells/RegrowthAndClearcasting';
import Swiftmend from 'analysis/retail/druid/restoration/modules/spells/Swiftmend';
import { TALENTS_DRUID } from 'common/TALENTS';

/** Resto Druid exetension of HealingEfficiencyTracker */
class RestoDruidHealingEfficiencyTracker extends HealingEfficiencyTracker {
  static dependencies = {
    ...HealingEfficiencyTracker.dependencies,
    manaTracker: ManaTracker,
    abilityTracker: AbilityTracker,
    healingDone: HealingDone,
    damageDone: DamageDone,
    castEfficiency: CastEfficiency,

    // Custom dependencies
    abilities: Abilities,
    clearcasting: RegrowthAndClearcasting,
    swiftmend: Swiftmend,
    hotAttributor: HotAttributor,
  };

  protected healingDone!: HealingDone;
  protected swiftmend!: Swiftmend;
  protected hotAttributor!: HotAttributor;

  getCustomSpellStats(spellInfo: SpellInfoDetails, spellId: number) {
    // If we have a spell that has custom logic for the healing/damage numbers, do that before the rest of our calculations.
    if (spellId === SPELLS.REJUVENATION.id) {
      spellInfo = this.getRejuvDetails(spellInfo);
    } else if (spellId === SPELLS.WILD_GROWTH.id) {
      spellInfo = this.getWgDetails(spellInfo);
    } else if (spellId === SPELLS.REGROWTH.id) {
      spellInfo = this.getRegrowthDetails(spellInfo);
    } else if (spellId === SPELLS.LIFEBLOOM_HOT_HEAL.id) {
      spellInfo = this.getLbDetails(spellInfo);
    } else if (spellId === SPELLS.SWIFTMEND.id) {
      spellInfo = this.getSmDetails(spellInfo);
    } else if (spellId === SPELLS.EFFLORESCENCE_CAST.id) {
      spellInfo = this.getEffloDetails(spellInfo);
    } else if (spellId === TALENTS_DRUID.OVERGROWTH_TALENT.id) {
      spellInfo = this.getOvergrowthDetails(spellInfo);
    }

    return spellInfo;
  }

  getRejuvDetails(spellInfo: SpellInfoDetails) {
    // for what we're displaying we only need the effective healing done
    spellInfo.healingDone = this.hotAttributor.rejuvHardcastAttrib.healing;
    return spellInfo;
  }

  getWgDetails(spellInfo: SpellInfoDetails) {
    // for what we're displaying we only need the effective healing done
    spellInfo.healingDone = this.hotAttributor.wgHardcastAttrib.healing;
    return spellInfo;
  }

  getRegrowthDetails(spellInfo: SpellInfoDetails) {
    // for what we're displaying we only need the effective healing done
    spellInfo.healingDone = this.hotAttributor.regrowthHardcastAttrib.healing;
    return spellInfo;
  }

  getLbDetails(spellInfo: SpellInfoDetails) {
    // for what we're displaying we only need the effective healing done
    spellInfo.healingDone = this.hotAttributor.lbHardcastAttrib.healing;
    return spellInfo;
  }

  getSmDetails(spellInfo: SpellInfoDetails) {
    // for what we're displaying we only need the effective healing done
    spellInfo.healingDone = this.swiftmend.hardcastSwiftmendHealing;
    return spellInfo;
  }

  getOvergrowthDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone = this.hotAttributor.overgrowthAttrib.healing;
    return spellInfo;
  }

  getEffloDetails(spellInfo: SpellInfoDetails) {
    spellInfo.healingDone = this.healingDone.byAbility(SPELLS.EFFLORESCENCE_HEAL.id).effective;
    return spellInfo;
  }
}

export default RestoDruidHealingEfficiencyTracker;

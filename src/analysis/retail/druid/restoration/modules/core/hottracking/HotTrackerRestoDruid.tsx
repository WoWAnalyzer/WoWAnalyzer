import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import HotTracker, {
  Attribution,
  HotInfo,
  Tracker,
  TrackersBySpell,
} from 'parser/shared/modules/HotTracker';

import Mastery from '../../../modules/core/Mastery';
import {
  ABILITIES_AFFECTED_BY_HEALING_INCREASES,
  MASTERY_STACK_BUFF_IDS,
} from 'analysis/retail/druid/restoration/constants';
import { TALENTS_DRUID } from 'common/TALENTS';

export const GERMINATION_ATT_NAME = 'Germination extension';
export const IMP_REJUV_ATT_NAME = 'Improved Rejuvenation extension';
export const THRIVING_VEG_ATT_NAME = 'Thriving Vegetation extension';

class HotTrackerRestoDruid extends HotTracker {
  static dependencies = {
    ...HotTracker.dependencies,
    mastery: Mastery,
  };

  mastery!: Mastery;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  /**
   * For each Attribution we also want to credit its mastery benefit to other heals
   */
  onHeal(event: HealEvent) {
    // find if spell benefits from mastery and if there are other HoTs possibly boosting it on the same target
    const spellId = event.ability.guid;
    if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId)) {
      return;
    }
    const targetId = event.targetID;
    const trackersOnTarget: TrackersBySpell | undefined = this.hots[targetId];
    if (!trackersOnTarget || !trackersOnTarget[spellId]) {
      return;
    }
    // figure out the amount of healing attributable to each stack
    const decomposedHeal = this.mastery.decomposeHeal(event);
    if (decomposedHeal === null) {
      return;
    }
    const oneStackHealing = decomposedHeal.oneStack;

    // for each mastery stack HoT on the same target, one stack of healing
    const ourTracker = trackersOnTarget[spellId];
    const ourAttributions = this._getActiveAttributions(ourTracker);
    Object.keys(trackersOnTarget).forEach((id) => {
      const nid = Number(id);
      if (spellId === nid || !MASTERY_STACK_BUFF_IDS.includes(nid)) {
        return; // must give a mastery stack and not be the current heal
      }

      // TODO handle multi-stack LB here
      const tracker = trackersOnTarget[nid];
      const otherAttributions = this._getActiveAttributions(tracker);
      // attribute to the other HoT the healing it caused here due to its mastery stack
      otherAttributions.forEach((att) => {
        // avoid cross attributing between two things with same attribution - will cause double count
        if (!ourAttributions.includes(att)) {
          att.healing += oneStackHealing;
        }
      });
    });
  }

  /**
   * Gets the currently 'active' attributions on a tracker. The active attributions are all
   * the full attributions and also whichever extension is currently ticking.
   */
  _getActiveAttributions(tracker: Tracker): Attribution[] {
    const activeAttributions = [];
    tracker.attributions.forEach((att) => activeAttributions.push(att));
    if (tracker.extensions.length > 0 && this.owner.currentTimestamp > tracker.originalEnd) {
      activeAttributions.push(tracker.extensions[0].attribution);
    }
    return activeAttributions;
  }

  _generateHotInfo(): HotInfo[] {
    const impRejuvRank = this.selectedCombatant.getTalentRank(
      TALENTS_DRUID.LINGERING_HEALING_TALENT,
    );
    const germinationRank = this.selectedCombatant.getTalentRank(TALENTS_DRUID.GERMINATION_TALENT);
    const thrivingVegetationRank = this.selectedCombatant.getTalentRank(
      TALENTS_DRUID.THRIVING_VEGETATION_TALENT,
    );

    const improvedRejuvenationAtt = HotTracker.getNewAttribution(IMP_REJUV_ATT_NAME);
    const germinationAtt = HotTracker.getNewAttribution(GERMINATION_ATT_NAME);
    const thrivingVegetationAtt = HotTracker.getNewAttribution(THRIVING_VEG_ATT_NAME);

    return [
      {
        spell: SPELLS.REJUVENATION,
        duration: 12000,
        tickPeriod: 3000,
        baseExtensions: [
          { attribution: germinationAtt, amount: germinationRank * 2000 },
          { attribution: improvedRejuvenationAtt, amount: impRejuvRank * 3000 },
        ],
      },
      {
        spell: SPELLS.REJUVENATION_GERMINATION,
        duration: 12000,
        tickPeriod: 3000,
        baseExtensions: [
          { attribution: germinationAtt, amount: germinationRank * 2000 },
          { attribution: improvedRejuvenationAtt, amount: impRejuvRank * 3000 },
        ],
      },
      {
        spell: SPELLS.REGROWTH,
        duration: 12000,
        tickPeriod: 2000,
        baseExtensions: [
          { attribution: thrivingVegetationAtt, amount: thrivingVegetationRank * 3000 },
        ],
      },
      {
        spell: SPELLS.WILD_GROWTH,
        duration: 7000,
        tickPeriod: 1000,
      },
      {
        spell: SPELLS.LIFEBLOOM_HOT_HEAL,
        duration: 15000,
        tickPeriod: 1000,
      },
      {
        spell: SPELLS.LIFEBLOOM_UNDERGROWTH_HOT_HEAL,
        duration: 15000,
        tickPeriod: 1000,
      },
      {
        spell: SPELLS.CENARION_WARD_HEAL,
        duration:
          8000 + this.selectedCombatant.getTalentRank(TALENTS_DRUID.WILDWOOD_ROOTS_TALENT) * 2000,
        tickPeriod: 2000,
      },
      {
        spell: SPELLS.CULTIVATION,
        duration: 6000,
        tickPeriod: 2000,
      },
      {
        spell: SPELLS.SPRING_BLOSSOMS,
        duration: 6000,
        tickPeriod: 2000,
        noHaste: true,
      },
      {
        spell: SPELLS.TRANQUILITY_HEAL,
        duration: 8000,
        tickPeriod: 2000,
        refreshNoPandemic: true,
      },
      {
        spell: SPELLS.ADAPTIVE_SWARM_HEAL,
        duration: 12000,
        tickPeriod: 2000,
      },
      {
        spell: SPELLS.RENEWING_BLOOM,
        duration: 8000,
        tickPeriod: 1000,
      },
      {
        spell: SPELLS.GROVE_TENDING,
        duration: 9000,
        tickPeriod: 3000,
      },
      // Wildstalker's Symbiotic Bloom appears to largely not interact with extensions
      // and other similar mechanics, so is inteniontally left out of this list.
    ];
  }
}

export default HotTrackerRestoDruid;

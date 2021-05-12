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
import { getSpellInfo } from '../../../SpellInfo';

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
    if (!getSpellInfo(spellId).mastery) {
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
      if (spellId === nid || !getSpellInfo(nid).masteryStack) {
        return; // must give a mastery stack and not be the current heal
      }

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
    return [
      {
        spell: SPELLS.REJUVENATION,
        duration: 15000,
        tickPeriod: 3000,
      },
      {
        spell: SPELLS.REJUVENATION_GERMINATION,
        duration: 15000,
        tickPeriod: 3000,
      },
      {
        spell: SPELLS.REGROWTH,
        duration: 12000,
        tickPeriod: 2000,
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
        spell: SPELLS.LIFEBLOOM_DTL_HOT_HEAL,
        duration: 15000,
        tickPeriod: 1000,
      },
      {
        spell: SPELLS.CENARION_WARD_HEAL,
        duration: 8000,
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
    ];
  }
}

export default HotTrackerRestoDruid;

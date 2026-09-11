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
import { getSourceBloom } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { TALENTS_DRUID } from 'common/TALENTS';

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
    const sourceBloom =
      spellId === SPELLS.EVERBLOOM_SPLASH_HEAL.id ? getSourceBloom(event) : undefined;
    const isSymbioticRelationshipCopy = spellId === SPELLS.SYMBIOTIC_RELATIONSHIP_HEAL.id;
    if (
      !ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId) &&
      !sourceBloom &&
      !isSymbioticRelationshipCopy
    ) {
      return;
    }
    // Copy heals inherit mastery from HoTs on the source target, not the copy's target.
    let targetId: number | undefined = sourceBloom?.targetID ?? event.targetID;
    if (isSymbioticRelationshipCopy) {
      targetId =
        event.targetID === this.selectedCombatant.id
          ? this.mastery.getBondedAllyId()
          : this.selectedCombatant.id;
    }
    if (targetId === undefined) {
      return;
    }
    const trackersOnTarget: TrackersBySpell | undefined = this.hots[targetId];
    const buffSpellId =
      sourceBloom || isSymbioticRelationshipCopy ? undefined : this.getBuffSpellIdForHeal(spellId);
    if (!trackersOnTarget || (buffSpellId !== undefined && !trackersOnTarget[buffSpellId])) {
      return;
    }
    // figure out the amount of healing attributable to each stack
    const decomposedHeal = this.mastery.decomposeHeal(event);
    if (decomposedHeal === null) {
      return;
    }
    const oneStackHealing = decomposedHeal.oneStack;

    // for each mastery stack HoT on the same target, one stack of healing
    const ourAttributions =
      buffSpellId !== undefined ? this._getActiveAttributions(trackersOnTarget[buffSpellId]) : [];
    Object.keys(trackersOnTarget).forEach((id) => {
      const nid = Number(id);
      if (buffSpellId === nid || !MASTERY_STACK_BUFF_IDS.includes(nid)) {
        return; // must give a mastery stack and not be the current heal
      }

      const tracker = trackersOnTarget[nid];
      const otherAttributions = this._getActiveAttributions(tracker);
      // Lifebloom provides extra Mastery stacks with Harmonius Blooming, so it credits multiple
      // stacks of healing - mirrors Mastery._tallyMasteryBenefit's stackMult.
      const stackMult = nid === this.mastery.lbBuffId ? 1 + this.mastery.extraLbStacks : 1;
      // attribute to the other HoT the healing it caused here due to its mastery stack(s)
      otherAttributions.forEach((att) => {
        // avoid cross attributing between two things with same attribution - will cause double count
        if (!ourAttributions.includes(att)) {
          att.healing += oneStackHealing * stackMult;
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
    const thrivingVegetationRank = this.selectedCombatant.getTalentRank(
      TALENTS_DRUID.THRIVING_VEGETATION_TALENT,
    );

    const improvedRejuvenationAtt = HotTracker.getNewAttribution(IMP_REJUV_ATT_NAME);
    const thrivingVegetationAtt = HotTracker.getNewAttribution(THRIVING_VEG_ATT_NAME);

    return [
      {
        spell: SPELLS.REJUVENATION,
        duration: 12000,
        tickPeriod: 3000,
        baseExtensions: [{ attribution: improvedRejuvenationAtt, amount: impRejuvRank * 3000 }],
      },
      {
        spell: SPELLS.REJUVENATION_GERMINATION,
        duration: 12000,
        tickPeriod: 3000,
        baseExtensions: [{ attribution: improvedRejuvenationAtt, amount: impRejuvRank * 3000 }],
      },
      {
        spell: SPELLS.REGROWTH,
        duration: 6000,
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
        spell: SPELLS.LIFEBLOOM_BUFF,
        healSpell: SPELLS.LIFEBLOOM_HOT_HEAL,
        duration: 15000,
        tickPeriod: 1000,
      },
      {
        spell: SPELLS.TRANQUILITY_HEAL,
        duration: 8000,
        tickPeriod: 2000,
        refreshNoPandemic: true,
      },
      // Symbiotic Bloom mostly ignores extensions, so it's left out on purpose.
    ];
  }
}

export default HotTrackerRestoDruid;

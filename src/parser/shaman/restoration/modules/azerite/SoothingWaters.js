import HIT_TYPES from 'game/HIT_TYPES';
import SPELLS from 'common/SPELLS';
import StatTracker from 'parser/shared/modules/StatTracker';
import CritEffectBonus from 'parser/shared/modules/helpers/CritEffectBonus';
import BaseHealerAzerite from './BaseHealerAzerite';

const HEAL_WINDOW_MS = 150;

class SoothingWaters extends BaseHealerAzerite {
  static dependencies = {
    statTracker: StatTracker,
    critEffectBonus: CritEffectBonus,
  };
  static TRAIT = SPELLS.SOOTHING_WATERS_TRAIT.id;
  static HEAL = SPELLS.SOOTHING_WATERS_TRAIT.id;

  buffer = [];
  traitRawHealing = 0;
  intellectOnHeal = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(this.constructor.TRAIT);
    if (!this.active) {
      return;
    }

    this.traitRawHealing = this.azerite.reduce((total, trait) => total + trait.rawHealing, 0);
  }

  // Similar to the High Tide module, we can't use the actual chain heal events as they're in the wrong order.
  // We're buffering the events, calculate the base healing and find out which is the initial one by finding the biggest healing event.
  // more information on the "why" here: https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/parser/shaman/restoration/modules/talents/HighTide.js#L55
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.CHAIN_HEAL.id) {
      return;
    }

    // Detects new chain heal casts, can't use the cast event for this as its often somewhere in between its healing events
    if (!this.chainHealTimestamp || event.timestamp - this.chainHealTimestamp > HEAL_WINDOW_MS) {
      this.processBuffer();
      this.chainHealTimestamp = event.timestamp;
    }

    let heal = event.amount + (event.absorb || 0) + (event.overheal || 0);
    if (event.hitType === HIT_TYPES.CRIT) {
      const critMult = this.critEffectBonus.getBonus(event);
      heal /= critMult;
    }
    const currentMastery = this.statTracker.currentMasteryPercentage;
    const masteryEffectiveness = Math.max(0, 1 - (event.hitPoints - event.amount) / event.maxHitPoints);
    const baseHealingDone = heal / (1 + currentMastery * masteryEffectiveness);
    this.intellectOnHeal = this.statTracker.currentIntellectRating;

    this.buffer.push({
      baseHealingDone: baseHealingDone,
      ...event,
    });
  }

  processBuffer() {
    if (!this.buffer[0]) {
      return;
    }
    // we only need the event with the highest healing done, which is the initial
    const initialHitEvent = this.buffer.reduce((prev, curr) => prev.baseHealingDone > curr.baseHealingDone ? prev : curr);

    const initialHitHealing = SPELLS.CHAIN_HEAL.coefficient * this.intellectOnHeal;
    const traitComponent = this.traitRawHealing / (initialHitHealing + this.traitRawHealing);

    this.processHealing(initialHitEvent, traitComponent);
    this.buffer = [];
  }

  on_finished() {
    this.processBuffer();
  }
}

export default SoothingWaters;

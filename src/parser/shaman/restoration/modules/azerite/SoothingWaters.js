import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import StatTracker from 'parser/shared/modules/StatTracker';
import CritEffectBonus from 'parser/shared/modules/helpers/CritEffectBonus';
import BaseHealerAzerite from './BaseHealerAzerite';

const HEAL_WINDOW_MS = 100;

/**
 * Soothing Waters:
 * Your Chain Heal heals its primary target for an additional 756 healing.
 */

class SoothingWaters extends BaseHealerAzerite {
  static dependencies = {
    statTracker: StatTracker,
    critEffectBonus: CritEffectBonus,
  };
  static TRAIT = SPELLS.SOOTHING_WATERS_TRAIT;
  static HEAL = SPELLS.SOOTHING_WATERS_TRAIT;

  traitRawHealing = 0;

  chainHealEvent;
  chainHealTarget;

  constructor(...args) {
    super(...args);
    this.active = this.hasTrait;
    if (!this.active) {
      return;
    }
    this.traitRawHealing = this.azerite.reduce((total, trait) => total + trait.rawHealing, 0);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CHAIN_HEAL), this._onChainHealCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHAIN_HEAL), this._onChainHealHeal);
  }

  _onChainHealCast(event) {
    // filtering out healing events if they're not from the current cast
    if (this.chainHealEvent && event.timestamp - this.chainHealEvent.timestamp >= HEAL_WINDOW_MS) {
      this.chainHealEvent = null;
    }

    // sometimes you have heal events before the cast happens, so check here as well
    // comparing the target ID guarantees no false positives as each cast can only heal the same target once
    if (this.chainHealEvent && this.chainHealEvent.targetID === event.targetID) {
      this._processHealing(this.chainHealEvent,this.traitComponent);
      this.chainHealEvent = null;
    } else {
      this.chainHealTarget = event.targetID;
    }
  }

  _onChainHealHeal(event) {
    // we only want the initial heal - as that is the heal on the person you target on the cast,
    // you only have to compare the heal and target ID.
    if (this.chainHealTarget && this.chainHealTarget === event.targetID) {
      this._processHealing(event,this.traitComponent);
      this.chainHealTarget = null;
    } else {
      this.chainHealEvent = event;
    }
  }

  get traitComponent() {
    const currentIntellect = this.statTracker.currentIntellectRating;
    const initialHitHealing = SPELLS.CHAIN_HEAL.coefficient * currentIntellect;
    return this.traitRawHealing / (initialHitHealing + this.traitRawHealing);
  }
}

export default SoothingWaters;

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { NATURES_FOCUS_RANKS } from '../../../constants';

const HEAL_WINDOW_MS = 100;

/**
 * CH heals more AYAYA
 * https://www.warcraftlogs.com/reports/8HtnKrqLJ7y9VFQ6#fight=21&type=summary&source=88
 */
class NaturesFocus extends Analyzer {
  conduitRank = 0;
  healingBoost = 0;
  healing = 0;
  chainHealEvent: CastEvent | HealEvent | null = null;

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.NATURES_FOCUS.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }
    this.healingBoost = NATURES_FOCUS_RANKS[this.conduitRank] / 100;

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CHAIN_HEAL),
      this._onChainHealCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHAIN_HEAL),
      this._onChainHealHeal,
    );
  }

  _onChainHealCast(event: CastEvent) {
    // filtering out healing events if they're not from the current cast
    if (this.chainHealEvent && event.timestamp - this.chainHealEvent.timestamp >= HEAL_WINDOW_MS) {
      this.chainHealEvent = null;
    }

    // sometimes you have heal events before the cast happens, so check here as well
    // comparing the target ID guarantees no false positives as each cast can only heal the same target once
    if (this.chainHealEvent && this.chainHealEvent.targetID === event.targetID) {
      if ('amount' in this.chainHealEvent) {
        // should always be a HealEvent, but just in case...
        this.healing += calculateEffectiveHealing(
          this.chainHealEvent as { amount: number },
          this.healingBoost,
        );
      }
      this.chainHealEvent = null;
    } else {
      this.chainHealEvent = event;
    }
  }

  _onChainHealHeal(event: HealEvent) {
    // we only want the initial heal - as that is the heal on the person you target on the cast,
    // you only have to compare the heal and target ID.
    if (this.chainHealEvent && this.chainHealEvent.targetID === event.targetID) {
      this.healing += calculateEffectiveHealing(event, this.healingBoost);
      this.chainHealEvent = null;
    } else if (!this.chainHealEvent) {
      this.chainHealEvent = event;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spellId={SPELLS.NATURES_FOCUS.id} rank={this.conduitRank}>
          <ItemHealingDone amount={this.healing} />
          <br />
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default NaturesFocus;

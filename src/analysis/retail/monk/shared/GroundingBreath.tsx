import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import conduitScaling from 'parser/core/conduitScaling';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { ResourceChangeEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class GroundingBreath extends Analyzer {
  healing = 0;
  resourceReturned = 0;

  healingBoost = 0;

  /**
   * Increase vivify healing on yourself by x% and has a 30% chance to refund any vivify.
   */
  constructor(options: Options) {
    super(options);

    const conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.GROUNDING_BREATH.id);

    if (!conduitRank) {
      this.active = false;
      return;
    }

    this.healingBoost = conduitScaling(0.15, conduitRank);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.vivifyBoost);
    this.addEventListener(
      Events.resourcechange
        .by(SELECTED_PLAYER)
        .spell([SPELLS.GROUNDING_BREATH_MANA_RETURN, SPELLS.GROUNDING_BREATH_ENERGY_RETURN]),
      this.onResourceRefund,
    );
  }

  vivifyBoost(event: HealEvent) {
    if (event.targetID !== event.sourceID) {
      return;
    }
    this.healing += calculateEffectiveHealing(event, this.healingBoost) || 0;
  }

  onResourceRefund(event: ResourceChangeEvent) {
    this.resourceReturned += event.resourceChange;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spellId={SPELLS.GROUNDING_BREATH.id}>
          <ItemManaGained amount={this.resourceReturned} />
          <br />
          <ItemHealingDone amount={this.healing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GroundingBreath;

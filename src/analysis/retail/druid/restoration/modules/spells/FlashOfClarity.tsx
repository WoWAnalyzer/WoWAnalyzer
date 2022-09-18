import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';

const REGROWTH_BOOST = 0.3;

/**
 * **Flash of Clarity**
 * Spec Talent Tier 3
 *
 * Clearcast Regrowths heal for an additional 30%.
 */
class FlashOfClarity extends Analyzer {
  healing = 0;
  targetsWithClearCastingRegrowth: number[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.FLASH_OF_CLARITY_RESTORATION_TALENT,
    );

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.checkIfClearCasting,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.normalizeBoost,
    );
  }

  checkIfClearCasting(event: CastEvent) {
    const targetID = event.targetID;
    if (!targetID) {
      return;
    }

    if (this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_BUFF.id)) {
      this.targetsWithClearCastingRegrowth[targetID] = targetID;
    } else if (this.targetsWithClearCastingRegrowth[targetID]) {
      delete this.targetsWithClearCastingRegrowth[targetID];
    }
  }

  normalizeBoost(event: HealEvent) {
    if (this.targetsWithClearCastingRegrowth[event.targetID]) {
      this.healing += calculateEffectiveHealing(event, REGROWTH_BOOST);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spellId={SPELLS.FLASH_OF_CLARITY.id}>
          <ItemPercentHealingDone amount={this.healing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FlashOfClarity;

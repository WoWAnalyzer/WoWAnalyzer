import AtonementAnalyzer, {
  AtonementAnalyzerEvent,
} from 'analysis/retail/priest/discipline/modules/core/AtonementAnalyzer';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const HOLD_YOUR_GROUND_BUFF_PERCENT = 0.06;

class HoldYourGround extends Analyzer {
  healing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasSoulbindTrait(SPELLS.HOLD_YOUR_GROUND_TRAIT.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.handleAtone);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  handleAtone(event: AtonementAnalyzerEvent) {
    if (
      !('absorb' in event.healEvent) ||
      !this.selectedCombatant.hasBuff(SPELLS.HOLD_YOUR_GROUND.id)
    ) {
      // ignoring spirit shell
      return;
    }
    this.healing += calculateEffectiveHealing(event.healEvent, HOLD_YOUR_GROUND_BUFF_PERCENT);
  }

  onHeal(event: HealEvent) {
    if (
      event.ability.guid === SPELLS.ATONEMENT_HEAL_CRIT.id ||
      event.ability.guid === SPELLS.ATONEMENT_HEAL_NON_CRIT.id ||
      !this.selectedCombatant.hasBuff(SPELLS.HOLD_YOUR_GROUND.id)
    ) {
      return;
    }
    this.healing += calculateEffectiveHealing(event, HOLD_YOUR_GROUND_BUFF_PERCENT);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <>
          <BoringSpellValueText spellId={SPELLS.HOLD_YOUR_GROUND.id}>
            <ItemHealingDone amount={this.healing} /> <br />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default HoldYourGround;

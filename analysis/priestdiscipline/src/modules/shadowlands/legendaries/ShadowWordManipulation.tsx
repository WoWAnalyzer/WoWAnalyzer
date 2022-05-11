import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffStackEvent, RemoveBuffEvent } from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../../core/AtonementAnalyzer';

class ShadowWordManipulation extends Analyzer {
  protected statTracker!: StatTracker;

  static dependencies = {
    statTracker: StatTracker,
  };

  healing = 0;
  swmBuffActive = false;
  stacks = 0;
  totalCritPercentage = 0;
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasLegendary(SPELLS.SHADOW_WORD_MANIPULATION);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuffstack.spell(SPELLS.SHADOW_WORD_MANIPULATION_BUFF).by(SELECTED_PLAYER),
      this.swmBuffed,
    );

    this.addEventListener(
      Events.removebuff.spell(SPELLS.SHADOW_WORD_MANIPULATION_BUFF).by(SELECTED_PLAYER),
      this.swmRemoved,
    );

    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.handleAtone);
  }
  swmBuffed(event: ApplyBuffStackEvent) {
    this.swmBuffActive = true;
    this.stacks = event.stack;
  }

  swmRemoved(event: RemoveBuffEvent) {
    this.swmBuffActive = false;
    this.stacks = 0;
  }

  handleAtone(event: AtonementAnalyzerEvent) {
    if (!('absorb' in event.healEvent) || !this.swmBuffActive) {
      // ignoring spirit shell
      // console.log(event);
      return;
    }
    console.log(event);
    const bonusCrit = this.stacks * 0.05;
    const effectiveHealing = event.healEvent.amount + (event.healEvent.absorbed || 0);
    const totalHealing = effectiveHealing + (event.healEvent.overheal || 0); // raw heal
    const swmHeal =
      totalHealing -
      (totalHealing / (1 + this.statTracker.currentCritPercentage + bonusCrit)) *
        (this.statTracker.currentCritPercentage + 1);
    const effectiveSwmHeal = swmHeal - (event.healEvent.overheal || 0);
    console.log(effectiveSwmHeal);
    if (effectiveSwmHeal > 0) {
      this.healing += effectiveSwmHeal;
    }
    // this.statTracker.currentCritPercentage
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={<></>}
      >
        <>
          <BoringSpellValueText spellId={SPELLS.SHADOW_WORD_MANIPULATION.id}>
            <ItemHealingDone amount={this.healing} /> <br />
            {/* <ItemManaGained amount={manaSaved} /> */}
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default ShadowWordManipulation;

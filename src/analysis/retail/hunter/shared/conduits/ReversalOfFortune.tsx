import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent, InterruptEvent } from 'parser/core/Events';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class ReversalOfFortune extends Analyzer {
  conduitRank = 0;
  focusGained = 0;
  focusWasted = 0;
  interrupts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.REVERSAL_OF_FORTUNE_CONDUIT.id);
    if (!this.active) {
      return;
    }

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(
      SPELLS.REVERSAL_OF_FORTUNE_CONDUIT.id,
    );

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.REVERSAL_OF_FORTUNE_ENERGIZE),
      this.onEnergize,
    );
    this.addEventListener(
      Events.interrupt.by(SELECTED_PLAYER).spell([SPELLS.COUNTER_SHOT, SPELLS.MUZZLE]),
      this.onInterrupt,
    );
  }

  onEnergize(event: ResourceChangeEvent) {
    this.focusGained += event.resourceChange;
    this.focusWasted += event.waste;
  }

  onInterrupt(event: InterruptEvent) {
    this.interrupts += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spellId={SPELLS.REVERSAL_OF_FORTUNE_CONDUIT.id} rank={this.conduitRank}>
          <>
            <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink /> {this.focusGained}/
            {this.focusWasted + this.focusGained} <small>Focus gained</small>
            <br />
            {this.interrupts} <small>interrupts</small>
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default ReversalOfFortune;

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { SWIFT_PENITENCE_INCREASE } from '@wowanalyzer/priest-discipline/src/constants';

import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../../core/AtonementAnalyzer';

// is this needed?
interface DirtyDamageEvent extends DamageEvent {
  penanceBoltNumber?: number;
}
// interface DirtyHealEvent extends HealEvent {
//   penanceBoltNumber?: number;
// }

class SwiftPenitence extends Analyzer {
  conduitRank: number = 0;
  bonusSwiftPenitenceAtoneHealing: number = 0;
  bonusSwiftPenitenceDirectHealing: number = 0;
  conduitIncrease: number = 0; // what is this?

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.SWIFT_PENITENCE.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }
    this.conduitIncrease = SWIFT_PENITENCE_INCREASE[this.conduitRank];

    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtone);
    // this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.PENANCE_HEAL), this.onHeal);
  }

  onAtone(event: AtonementAnalyzerEvent) {
    const { penanceBoltNumber } = event.damageEvent as DirtyDamageEvent;
    if (event.damageEvent.ability.name === 'Penance' && event.damageEvent.penanceBoltNumber === 0) {
      const totalHealing =
        event.healEvent.amount + (event.healEvent.overheal || 0) + (event.healEvent.absorbed || 0);
      const adjustedHealing =
        event.healEvent.amount +
        (event.healEvent.absorbed || 0) -
        totalHealing / (1 + this.conduitIncrease);
      if (adjustedHealing >= 0) {
        this.bonusSwiftPenitenceAtoneHealing += adjustedHealing;
        console.log(event.healEvent);
      }
    }
    if (typeof penanceBoltNumber !== 'number') {
      return;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <>
          <ConduitSpellText spellId={SPELLS.SWIFT_PENITENCE.id} rank={this.conduitRank}>
            <ItemHealingDone amount={this.bonusSwiftPenitenceAtoneHealing} />
          </ConduitSpellText>
        </>
      </Statistic>
    );
  }
}

export default SwiftPenitence;

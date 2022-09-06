import { SWIFT_PENITENCE_INCREASE } from 'analysis/retail/priest-discipline/constants';
import {
  IsPenanceHealEvent,
  IsPenanceDamageEvent,
} from 'analysis/retail/priest-discipline/modules/spells/Helper';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../../core/AtonementAnalyzer';
import Penance from '../../spells/Penance';

// interface DirtyDamageEvent extends DamageEvent {
//   penanceBoltNumber?: number;
// }

interface DirtyHealEvent extends HealEvent {
  penanceBoltNumber?: number;
}

class SwiftPenitence extends Analyzer {
  static dependencies = {
    penance: Penance,
  };

  conduitRank: number = 0;
  bonusSwiftPenitenceAtoneHealing: number = 0;
  bonusSwiftPenitenceDirectHealing: number = 0;
  bonusSwiftPenitenceDamage: number = 0;
  conduitIncrease: number = 0;

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.SWIFT_PENITENCE.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }
    this.conduitIncrease = SWIFT_PENITENCE_INCREASE[this.conduitRank];

    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtone);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onAtone(event: AtonementAnalyzerEvent) {
    // const { penanceBoltNumber } = event.damageEvent as DirtyDamageEvent; Is this required?
    let absorbedHealing = 0;
    if ('sourceEvent' in event.healEvent && !('attackPower' in event.healEvent.sourceEvent)) {
      // is a SpiritShellEvent
      if ('absorbed' in event.healEvent.sourceEvent) {
        absorbedHealing = event.healEvent.sourceEvent.absorbed || 0;
      } else {
        absorbedHealing = event.healEvent.sourceEvent.amount || 0;
      }
    } else {
      // is a healEvent
      if (!('sourceEvent' in event.healEvent)) {
        // is a healEvent
        absorbedHealing = event.healEvent.absorbed || 0;
      }
    }
    if (
      event?.damageEvent &&
      IsPenanceDamageEvent(event.damageEvent) &&
      event.damageEvent.penanceBoltNumber === 0
    ) {
      const totalHealing =
        event.healEvent.amount + (event.healEvent.overheal || 0) + absorbedHealing;
      const adjustedHealing =
        event.healEvent.amount + absorbedHealing - totalHealing / (1 + this.conduitIncrease);
      if (adjustedHealing >= 0) {
        this.bonusSwiftPenitenceAtoneHealing += adjustedHealing;
      }
    }
  }

  onHeal(event: HealEvent) {
    if (!IsPenanceHealEvent(event)) {
      return;
    }
    const { penanceBoltNumber } = event as DirtyHealEvent;
    if (typeof penanceBoltNumber !== 'number') {
      return;
    }
    if (penanceBoltNumber === 0) {
      const totalHealing = event.amount + (event.overheal || 0) + (event.absorbed || 0);
      const adjustedHealing =
        event.amount + (event.absorbed || 0) - totalHealing / (1 + this.conduitIncrease);
      if (adjustedHealing >= 0) {
        this.bonusSwiftPenitenceDirectHealing += adjustedHealing;
      }
    }
  }

  onDamage(event: DamageEvent) {
    if (!IsPenanceDamageEvent(event)) {
      return;
    }

    if (event.penanceBoltNumber === 0) {
      this.bonusSwiftPenitenceDamage += event.amount / (1 + this.conduitIncrease);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            The top value represents healing from <SpellLink id={SPELLS.ATONEMENT_BUFF.id} />, while
            the lower value is the healing from directly healing a target with{' '}
            <SpellLink id={SPELLS.PENANCE_HEAL.id} />.
          </>
        }
      >
        <>
          <ConduitSpellText spellId={SPELLS.SWIFT_PENITENCE.id} rank={this.conduitRank}>
            <ItemHealingDone amount={this.bonusSwiftPenitenceAtoneHealing} /> <br />
            <ItemHealingDone amount={this.bonusSwiftPenitenceDirectHealing} /> <br />
            <ItemDamageDone amount={this.bonusSwiftPenitenceDamage} />
          </ConduitSpellText>
        </>
      </Statistic>
    );
  }
}

export default SwiftPenitence;

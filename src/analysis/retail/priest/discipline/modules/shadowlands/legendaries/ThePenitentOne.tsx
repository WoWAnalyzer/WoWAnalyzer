import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_PRIEST } from 'common/TALENTS';
import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../../core/AtonementAnalyzer';

// Mutating the events from years ago, just unlucky
interface DirtyDamageEvent extends DamageEvent {
  penanceBoltNumber?: number;
}
interface DirtyHealEvent extends HealEvent {
  penanceBoltNumber?: number;
}

class ThePenitentOne extends Analyzer {
  private expectedBolts = 3;
  private tpoAtonement = 0;
  private tpoDirect = 0;
  private tpoPenances = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasLegendary(SPELLS.THE_PENITENT_ONE);
    if (!this.active) {
      return;
    }

    this.expectedBolts = this.selectedCombatant.hasTalent(
      TALENTS_PRIEST.CASTIGATION_DISCIPLINE_TALENT.id,
    )
      ? 4
      : 3;
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtone);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.PENANCE_HEAL), this.onHeal);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PENANCE_CAST),
      this.checkTPO,
    );
  }

  checkTPO() {
    if (this.selectedCombatant.hasBuff(SPELLS.THE_PENITENT_ONE_BUFF.id)) {
      this.tpoPenances += 1;
    }
  }

  onAtone(event: AtonementAnalyzerEvent) {
    const { penanceBoltNumber } = event.damageEvent as DirtyDamageEvent;
    if (typeof penanceBoltNumber !== 'number') {
      return;
    }
    if (penanceBoltNumber + 1 <= this.expectedBolts) {
      return;
    }

    this.tpoAtonement += event.healEvent.amount;
  }

  onHeal(event: HealEvent) {
    const { penanceBoltNumber } = event as DirtyHealEvent;
    if (typeof penanceBoltNumber !== 'number') {
      return;
    }
    if (penanceBoltNumber + 1 <= this.expectedBolts) {
      return;
    }

    this.tpoDirect += event.amount;
  }

  statistic() {
    const manaSaved = this.tpoPenances * SPELLS.PENANCE.manaCost;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <strong>Atonement Healing:</strong> {formatThousands(this.tpoAtonement)}
            <br />
            <strong>Direct Healing:</strong> {formatThousands(this.tpoDirect)}
            <br />
            <strong>Mana saved:</strong> {formatThousands(manaSaved)}
          </>
        }
      >
        <>
          <BoringSpellValueText spellId={SPELLS.THE_PENITENT_ONE.id}>
            <ItemHealingDone amount={this.tpoAtonement + this.tpoDirect} /> <br />
            <ItemManaGained amount={manaSaved} />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default ThePenitentOne;

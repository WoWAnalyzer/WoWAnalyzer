import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { PenanceDamageEvent } from './Helper';
import { getDamageEvent } from '../../normalizers/AtonementTracker';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

interface DirtyHealEvent extends HealEvent {
  penanceBoltNumber?: number;
}

interface DirtyDamageEvent extends DamageEvent {
  penanceBoltNumber?: number;
}

class HarshDiscipline extends Analyzer {
  private expectedBolts = 3;
  private harshAtonement = 0;
  private harshDirect = 0;
  private damage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.HARSH_DISCIPLINE_TALENT);
    if (!this.active) {
      return;
    }

    this.expectedBolts = this.selectedCombatant.hasTalent(TALENTS_PRIEST.CASTIGATION_TALENT)
      ? 4
      : 3;
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ATONEMENT_HEAL_CRIT, SPELLS.ATONEMENT_HEAL_NON_CRIT]),
      this.onAtoneHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.PENANCE_HEAL, SPELLS.DARK_REPRIMAND_HEAL]),
      this.onHeal,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onAtoneHeal(event: HealEvent) {
    if (!getDamageEvent(event)) {
      return;
    }
    const damageEvent = getDamageEvent(event) as PenanceDamageEvent;

    if (
      damageEvent.ability.guid !== SPELLS.DARK_REPRIMAND_DAMAGE.id &&
      damageEvent.ability.guid !== SPELLS.PENANCE.id
    ) {
      return;
    }

    if (damageEvent.penanceBoltNumber < this.expectedBolts) {
      return;
    }
    this.harshAtonement += event.amount;
  }

  onDamage(event: DamageEvent) {
    const { penanceBoltNumber } = event as DirtyDamageEvent;
    if (typeof penanceBoltNumber !== 'number') {
      return;
    }
    if (penanceBoltNumber < this.expectedBolts) {
      return;
    }

    this.damage += event.amount;
  }

  onHeal(event: HealEvent) {
    const { penanceBoltNumber } = event as DirtyHealEvent;
    if (typeof penanceBoltNumber !== 'number') {
      return;
    }
    if (penanceBoltNumber < this.expectedBolts) {
      return;
    }

    this.harshDirect += event.amount;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <br />
            <strong>Atonement healing:</strong> {formatThousands(this.harshAtonement)}
            <br />
            <strong>Direct healing:</strong> {formatThousands(this.harshDirect)}
          </>
        }
      >
        <>
          <TalentSpellText talent={TALENTS_PRIEST.HARSH_DISCIPLINE_TALENT}>
            <ItemHealingDone amount={this.harshAtonement + this.harshDirect} /> <br />
            <ItemDamageDone amount={this.damage} />
          </TalentSpellText>
        </>
      </Statistic>
    );
  }
}

export default HarshDiscipline;

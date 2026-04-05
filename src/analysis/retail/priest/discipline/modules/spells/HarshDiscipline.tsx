import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { PenanceBoltType, PenanceDamageEvent, PenanceHealEvent } from './PenanceHelper';
import { getDamageEvent } from '../../normalizers/AtonementTracker';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { SpellLink } from 'interface';

class HarshDiscipline extends Analyzer {
  readonly expectedBoltNumbers: number[] = [];
  atonementHealing = 0;
  directHealing = 0;
  damage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.HARSH_DISCIPLINE_TALENT);
    if (!this.active) {
      return;
    }

    this.expectedBoltNumbers = this.selectedCombatant.hasTalent(TALENTS_PRIEST.CASTIGATION_TALENT)
      ? [5, 6]
      : [4, 5];

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ATONEMENT_HEAL_CRIT, SPELLS.ATONEMENT_HEAL_NON_CRIT]),
      this.onAtonementHeal,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.PENANCE_BOLT_DAMAGE, SPELLS.PENANCE_TWINSIGHT_BOLT_DAMAGE]),
      this.onDamage,
    );
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.PENANCE_BOLT_HEAL, SPELLS.PENANCE_TWINSIGHT_BOLT_HEAL]),
      this.onPenanceHeal,
    );
  }

  onAtonementHeal(event: HealEvent) {
    if (!getDamageEvent(event)) {
      return;
    }
    const damageEvent = getDamageEvent(event) as PenanceDamageEvent;

    if (
      damageEvent.penanceBoltType === PenanceBoltType.Normal &&
      this.expectedBoltNumbers.includes(damageEvent.penanceBoltNumber)
    ) {
      this.atonementHealing += event.amount;
    }
  }

  onDamage(event: PenanceDamageEvent) {
    if (
      event.penanceBoltType === PenanceBoltType.Normal &&
      this.expectedBoltNumbers.includes(event.penanceBoltNumber)
    ) {
      this.damage += event.amount;
    }
  }

  onPenanceHeal(event: PenanceHealEvent) {
    if (
      event.penanceBoltType === PenanceBoltType.Normal &&
      this.expectedBoltNumbers.includes(event.penanceBoltNumber)
    ) {
      this.directHealing += event.amount;
    }
  }

  get getTotalHealing() {
    return this.atonementHealing + this.directHealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <p>
              The effective damage & healing contributed by{' '}
              <SpellLink spell={TALENTS_PRIEST.HARSH_DISCIPLINE_TALENT} />. Damage that caused{' '}
              <SpellLink spell={TALENTS_PRIEST.ATONEMENT_TALENT} /> healing is included.
              Contributions are separated in the list below.
            </p>
            <ul>
              <li>
                Atonement:{' '}
                <ItemHealingDone amount={this.atonementHealing} displayPercentage={false} />
              </li>
              <li>
                Direct: <ItemHealingDone amount={this.directHealing} displayPercentage={false} />
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_PRIEST.HARSH_DISCIPLINE_TALENT}>
          <div>
            <ItemHealingDone amount={this.getTotalHealing} />
          </div>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default HarshDiscipline;

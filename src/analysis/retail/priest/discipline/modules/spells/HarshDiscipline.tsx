import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ManaIcon from 'interface/icons/Mana';
import { IsPenanceDamageEvent } from './Helper';
import { getDamageEvent } from '../../normalizers/AtonementTracker';

interface DirtyHealEvent extends HealEvent {
  penanceBoltNumber?: number;
}

class HarshDiscipline extends Analyzer {
  private expectedBolts = 3;
  private harshAtonement = 0;
  private harshDirect = 0;
  private harshPenances = 0;
  private testAtonement = 0;

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
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.PENANCE_HEAL), this.onHeal);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PENANCE_CAST),
      this.checkHarsh,
    );
  }

  checkHarsh() {
    if (this.selectedCombatant.hasBuff(SPELLS.HARSH_DISCIPLINE_BUFF.id)) {
      this.harshPenances += 1;
    }
  }

  onAtoneHeal(event: HealEvent) {
    if (!getDamageEvent(event)) {
      return;
    }
    const damageEvent = getDamageEvent(event);

    if (!IsPenanceDamageEvent(damageEvent)) {
      return;
    }

    if (damageEvent.penanceBoltNumber + 1 <= this.expectedBolts) {
      return;
    }
    this.harshAtonement += event.amount;
  }

  onHeal(event: HealEvent) {
    const { penanceBoltNumber } = event as DirtyHealEvent;
    if (typeof penanceBoltNumber !== 'number') {
      return;
    }
    if (penanceBoltNumber + 1 <= this.expectedBolts) {
      return;
    }

    this.harshDirect += event.amount;
  }

  statistic() {
    const manaSaved = this.harshPenances * SPELLS.PENANCE.manaCost;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <span>
              Penance consumed <SpellLink id={TALENTS_PRIEST.HARSH_DISCIPLINE_TALENT.id} />{' '}
              {this.harshPenances} times.{' '}
            </span>
            <br />
            <strong>Atonement healing:</strong> {formatThousands(this.harshAtonement)}
            <br />
            <strong>Direct healing:</strong> {formatThousands(this.harshDirect)}
            <br />
            <strong>Mana saved:</strong> {formatThousands(manaSaved)}
          </>
        }
      >
        <>
          <BoringSpellValueText spellId={TALENTS_PRIEST.HARSH_DISCIPLINE_TALENT.id}>
            <span>
              Rank {this.selectedCombatant.getTalentRank(TALENTS_PRIEST.HARSH_DISCIPLINE_TALENT)}
              <br />
            </span>
            <ItemHealingDone amount={this.harshAtonement + this.harshDirect} /> <br />
            <ManaIcon /> {formatThousands(manaSaved)} mana
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default HarshDiscipline;

import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class RapidDecomposition extends Analyzer {
  bpDamage = 0;
  dndDamage = 0;
  totalDamage = 0;
  DD_DAMAGE_TICK = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id)
    ? SPELLS.DEATHS_DUE_DAMAGE_TICK
    : SPELLS.DEATH_AND_DECAY_DAMAGE_TICK;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RAPID_DECOMPOSITION_TALENT.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.BLOOD_PLAGUE, this.DD_DAMAGE_TICK]),
      this.onDamage,
    );
  }

  onDamage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BLOOD_PLAGUE.id) {
      this.bpDamage += calculateEffectiveDamage(event, 0.15);
    } else {
      this.dndDamage += calculateEffectiveDamage(event, 0.15);
    }
    this.totalDamage = this.bpDamage + this.dndDamage;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <strong>Blood Plague:</strong> {this.owner.formatItemDamageDone(this.bpDamage)}
            <br />
            <strong>
              {this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id)
                ? "Death's Due"
                : 'Death And Decay'}
              :
            </strong>{' '}
            {this.owner.formatItemDamageDone(this.dndDamage)}
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.RAPID_DECOMPOSITION_TALENT.id}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RapidDecomposition;

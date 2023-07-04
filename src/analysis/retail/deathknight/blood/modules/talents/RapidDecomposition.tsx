import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class RapidDecomposition extends Analyzer {
  bpDamage = 0;
  dndDamage = 0;
  totalDamage = 0;

  DD_DAMAGE_TICK: Spell = SPELLS.DEATH_AND_DECAY_DAMAGE_TICK;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RAPID_DECOMPOSITION_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.BLOOD_PLAGUE, this.DD_DAMAGE_TICK]),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
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
          <Trans id="deathknight.blood.rapidDecomposition.statistic.tooltip">
            <strong>Blood Plague:</strong> {this.owner.formatItemDamageDone(this.bpDamage)}
            <br />
            <strong>{this.DD_DAMAGE_TICK.name}:</strong>{' '}
            {this.owner.formatItemDamageDone(this.dndDamage)}
          </Trans>
        }
      >
        <BoringSpellValueText spell={TALENTS.RAPID_DECOMPOSITION_TALENT}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RapidDecomposition;

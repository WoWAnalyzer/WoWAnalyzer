import { ALPHA_DAMAGE_KC_MODIFIER } from 'analysis/retail/hunter/survival/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Kill Command now has 2 charges, and deals 30% increased damage.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/ayK6THQGAB4Y8h9N#fight=15&type=summary&source=1415&translate=true
 */
class AlphaPredator extends Analyzer {
  private damage: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.ALPHA_PREDATOR_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.KILL_COMMAND_SURVIVAL_DAMAGE),
      this.onPetDamage,
    );
  }

  onPetDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, ALPHA_DAMAGE_KC_MODIFIER);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        tooltip={
          <>
            This statistic shows the damage gained from the increased Kill Command damage. It does
            not reflect the potential damage gain from having 2 charges of Kill Command or from the
            focus gain from Kill Command overall.
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.ALPHA_PREDATOR_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AlphaPredator;

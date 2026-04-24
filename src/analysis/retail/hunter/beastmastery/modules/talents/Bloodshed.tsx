import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Bestial Wrath causes your pet to tear into the target, applying a bleed.
 * Bleed damage has a 10% chance to summon a Dire Beast.
 */
class Bloodshed extends Analyzer {
  bleedDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLOODSHED_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.BLOODSHED_DEBUFF),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.bleedDamage += event.amount + (event.absorbed || 0);
  }

  // for some reason the bleed damage doesn't match the amount of damage in warcraft logs
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.BLOODSHED_TALENT}>
          <ItemDamageDone amount={this.bleedDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Bloodshed;

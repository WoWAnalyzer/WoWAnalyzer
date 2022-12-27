import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Hurls a Steel Trap to the target location that snaps shut on the
 * first enemy that approaches, immobilizing them for 20 sec and
 * causing them to bleed for (120% of Attack power) damage over 20 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/K8chFdJvxfywkPRG#fight=92&type=damage-done&source=988&translate=true&ability=162487
 */

class SteelTrap extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  damage = 0;
  casts = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.STEEL_TRAP_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.STEEL_TRAP_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.STEEL_TRAP_DEBUFF),
      this.onDamage,
    );
  }

  onCast() {
    this.casts += 1;
  }

  onDamage(event: DamageEvent) {
    if (this.casts === 0) {
      this.casts += 1;
      this.spellUsable.beginCooldown(event, TALENTS.STEEL_TRAP_TALENT.id);
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS.STEEL_TRAP_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SteelTrap;

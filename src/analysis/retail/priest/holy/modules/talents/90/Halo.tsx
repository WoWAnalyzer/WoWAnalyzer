import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// Example Log: /report/hRd3mpK1yTQ2tDJM/1-Mythic+MOTHER+-+Kill+(2:24)/14-丶寶寶小喵
class Halo extends Analyzer {
  haloDamage = 0;
  haloHealing = 0;
  haloOverhealing = 0;
  haloCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HALO_TALENT.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.HALO_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HALO_HEAL), this.onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HALO_TALENT), this.onCast);
  }

  onDamage(event: DamageEvent) {
    this.haloDamage += event.amount || 0;
  }

  onHeal(event: HealEvent) {
    this.haloHealing += event.amount || 0;
    this.haloOverhealing += event.overheal || 0;
  }

  onCast(event: CastEvent) {
    this.haloCasts += 1;
  }

  statistic() {
    return (
      <Statistic
        tooltip={`Halos Cast: ${this.haloCasts}`}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(6)}
      >
        <BoringSpellValueText spellId={SPELLS.HALO_TALENT.id}>
          <ItemHealingDone amount={this.haloHealing} />
          <br />
          <ItemDamageDone amount={this.haloDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Halo;

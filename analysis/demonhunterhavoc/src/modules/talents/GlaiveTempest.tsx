import { formatThousands } from 'common/format';
import DH_SPELLS from 'common/SPELLS/demonhunter';
import DH_TALENTS from 'common/SPELLS/talents/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class GlaiveTempest extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(DH_TALENTS.GLAIVE_TEMPEST_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(DH_SPELLS.GLAIVE_TEMPEST_DAMAGE),
      this.onDamageEvent,
    );
  }

  onDamageEvent(event: DamageEvent) {
    this.damage += event.amount + (event.absorb || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(3)}
        tooltip={
          <>
            {formatThousands(this.damage)} Total damage
            <br />
          </>
        }
      >
        <BoringSpellValueText spellId={DH_TALENTS.GLAIVE_TEMPEST_TALENT.id}>
          <>{this.owner.formatItemDamageDone(this.damage)}</>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GlaiveTempest;

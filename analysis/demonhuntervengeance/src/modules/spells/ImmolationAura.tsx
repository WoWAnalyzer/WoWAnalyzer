import { formatDuration, formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class ImmolationAura extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  immolationAuraDamage = 0;
  protected abilityTracker!: AbilityTracker;

  statistic() {
    const immolationAuraUptime = this.selectedCombatant.getBuffUptime(SPELLS.IMMOLATION_AURA.id);

    const immolationAuraUptimePercentage = immolationAuraUptime / this.owner.fightDuration;

    this.immolationAuraDamage =
      this.abilityTracker.getAbility(SPELLS.IMMOLATION_AURA_INITIAL_HIT_DAMAGE.id).damageEffective +
      this.abilityTracker.getAbility(SPELLS.IMMOLATION_AURA.id).damageEffective;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
        tooltip={
          <>
            The Immolation Aura total damage was {formatThousands(this.immolationAuraDamage)}.<br />
            The Immolation Aura total uptime was {formatDuration(immolationAuraUptime)}
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.IMMOLATION_AURA.id}>
          <>
            <UptimeIcon /> {formatPercentage(immolationAuraUptimePercentage)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ImmolationAura;

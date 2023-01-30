import { formatDuration, formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import Events, { CastEvent } from 'parser/core/Events';
import { getImmolationAuraInitialHits } from 'analysis/retail/demonhunter/vengeance/normalizers/ImmolationAuraLinker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class ImmolationAura extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  immolationAuraDamage = 0;
  castEntries: BoxRowEntry[] = [];
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.IMMOLATION_AURA),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const hitsWithInitialBurst = getImmolationAuraInitialHits(event);
    const hitWithInitialBurst = hitsWithInitialBurst.length > 0;
    const performance = hitWithInitialBurst
      ? QualitativePerformance.Good
      : QualitativePerformance.Fail;
    const performanceNote = hitWithInitialBurst ? (
      <>Hit {hitsWithInitialBurst.length} targets with initial burst</>
    ) : (
      <>Did not hit any targets with initial burst</>
    );

    const tooltip = (
      <>
        @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong>
        <br />
        {performanceNote}
      </>
    );

    this.castEntries.push({ value: performance, tooltip });
  }

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
          <UptimeIcon /> {formatPercentage(immolationAuraUptimePercentage)}% <small>uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ImmolationAura;

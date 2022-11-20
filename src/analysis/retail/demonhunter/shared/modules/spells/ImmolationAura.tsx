import { formatDuration, formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { Info } from 'parser/core/metric';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';

class ImmolationAura extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  immolationAuraDamage = 0;
  protected abilityTracker!: AbilityTracker;

  vengeanceGuideBreakdown(info: Info) {
    const falloutExplanation = (
      <>
        {' '}
        and having a chance to shatter a <SpellLink id={SPELLS.SOUL_FRAGMENT} /> with{' '}
        <SpellLink id={TALENTS_DEMON_HUNTER.FALLOUT_TALENT} />
      </>
    );
    const explanation = (
      <p>
        <strong>
          <SpellLink id={SPELLS.IMMOLATION_AURA} />
        </strong>{' '}
        is one of your primary <strong>builders</strong>. It deals a burst of damage when cast,
        generating 8 Fury immediately
        {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FALLOUT_TALENT) ? falloutExplanation : ''}.
        It then pulses damage every second for 6 seconds as well as generating 2 Fury on each pulse.
      </p>
    );
    const data = (
      <RoundedPanel>
        <CastEfficiencyBar
          spellId={SPELLS.IMMOLATION_AURA.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          minimizeIcons
        />
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data);
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
          <>
            <UptimeIcon /> {formatPercentage(immolationAuraUptimePercentage)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ImmolationAura;

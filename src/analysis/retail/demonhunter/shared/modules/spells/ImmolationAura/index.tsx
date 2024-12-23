import { formatDuration, formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Events, { CastEvent } from 'parser/core/Events';
import { getImmolationAuraInitialHits } from 'analysis/retail/demonhunter/vengeance/normalizers/ImmolationAuraLinker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellLink } from 'interface';
import FalloutSnippet from 'analysis/retail/demonhunter/shared/modules/spells/ImmolationAura/FalloutSnippet';
import { ChecklistUsageInfo, SpellUse, spellUseToBoxRowEntry } from 'parser/core/SpellUsage/core';
import SPECS from 'game/SPECS';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceLink from 'interface/ResourceLink';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';

class ImmolationAura extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  private cooldownUses: SpellUse[] = [];
  private immolationAuraDamage = 0;
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    if (this.selectedCombatant.specId === SPECS.VENGEANCE_DEMON_HUNTER.id) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.IMMOLATION_AURA),
        this.onVengeanceCast,
      );
    }
  }

  statistic() {
    const immolationAuraUptime = this.selectedCombatant.getBuffUptime(SPELLS.IMMOLATION_AURA.id);

    const immolationAuraUptimePercentage = immolationAuraUptime / this.owner.fightDuration;

    this.immolationAuraDamage =
      this.abilityTracker.getAbilityDamage(SPELLS.IMMOLATION_AURA_INITIAL_HIT_DAMAGE.id) +
      this.abilityTracker.getAbilityDamage(SPELLS.IMMOLATION_AURA.id);

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
        <BoringSpellValueText spell={SPELLS.IMMOLATION_AURA}>
          <UptimeIcon /> {formatPercentage(immolationAuraUptimePercentage)}% <small>uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  vengeanceGuideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.IMMOLATION_AURA} />
        </strong>{' '}
        is one of your primary <strong>builders</strong>. It deals a burst of damage when cast,
        generating 8 <ResourceLink id={RESOURCE_TYPES.FURY.id} /> immediately
        <FalloutSnippet />. It then pulses damage every second for 6 seconds as well as generating 2{' '}
        <ResourceLink id={RESOURCE_TYPES.FURY.id} /> on each pulse.
      </p>
    );

    const performances = this.cooldownUses.map((it) =>
      spellUseToBoxRowEntry(it, this.owner.fight.start_time),
    );

    const goodCasts = performances.filter((it) => it.value === QualitativePerformance.Good).length;
    const totalCasts = performances.length;

    return (
      <ContextualSpellUsageSubSection
        explanation={explanation}
        uses={this.cooldownUses}
        castBreakdownSmallText={<> - Green is a good cast, Red is a bad cast.</>}
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={
          <div style={{ marginBottom: 10 }}>
            <CastPerformanceSummary
              spell={SPELLS.IMMOLATION_AURA}
              casts={goodCasts}
              performance={QualitativePerformance.Good}
              totalCasts={totalCasts}
            />
            <strong>
              <SpellLink spell={SPELLS.IMMOLATION_AURA} /> cast efficiency
            </strong>
            <CastEfficiencyBar
              spellId={SPELLS.IMMOLATION_AURA.id}
              gapHighlightMode={GapHighlight.FullCooldown}
              minimizeIcons
              useThresholds
            />
          </div>
        }
      />
    );
  }

  private onVengeanceCast(event: CastEvent) {
    const hitsWithInitialBurst = getImmolationAuraInitialHits(event);
    const hitWithInitialBurst = hitsWithInitialBurst.length > 0;
    const performance = hitWithInitialBurst
      ? QualitativePerformance.Good
      : QualitativePerformance.Fail;
    const details = hitWithInitialBurst ? (
      <div>You hit {hitsWithInitialBurst.length} targets with the initial burst.</div>
    ) : (
      <div>
        You did not hit any targets with the initial burst.
        {this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FALLOUT_TALENT) ? (
          <>
            {' '}
            This is especially important when you have{' '}
            <SpellLink spell={TALENTS_DEMON_HUNTER.FALLOUT_TALENT} /> talented.
          </>
        ) : null}
      </div>
    );

    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'initial-hit',
        timestamp: event.timestamp,
        performance,
        summary: <div>Hit at least 1 target with initial burst</div>,
        details: details,
      },
    ];
    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );
    this.cooldownUses.push({
      event,
      performance: actualPerformance,
      checklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    });
  }
}

export default ImmolationAura;

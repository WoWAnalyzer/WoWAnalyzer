import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import Events, { CastEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import ResourceLink from 'interface/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { getSigilOfFlameDamages } from 'analysis/retail/demonhunter/shared/normalizers/SigilOfFlameNormalizer';
import Spell from 'common/SPELLS/Spell';
import HideGoodCastsSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';

export default class SigilOfFlame extends Analyzer {
  private cooldownUses: SpellUse[] = [];
  private readonly spell: Spell;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SIGIL_OF_FLAME_TALENT);
    if (this.selectedCombatant.hasTalent(TALENTS.CONCENTRATED_SIGILS_TALENT)) {
      this.spell = SPELLS.SIGIL_OF_FLAME_CONCENTRATED;
    } else if (this.selectedCombatant.hasTalent(TALENTS.PRECISE_SIGILS_TALENT)) {
      this.spell = SPELLS.SIGIL_OF_FLAME_PRECISE;
    } else {
      this.spell = TALENTS.SIGIL_OF_FLAME_TALENT;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.spell), this.onCast);
  }

  guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.SIGIL_OF_FLAME_TALENT} />
        </strong>{' '}
        is one of your <strong>builders</strong>. It generates{' '}
        <ResourceLink id={RESOURCE_TYPES.FURY.id} /> places a Sigil on the ground that activates
        after a delay, dealing fire damage immediately and applying a DoT to any targets hit.
      </p>
    );

    const goodCasts = this.cooldownUses.filter(
      (it) => it.performance === QualitativePerformance.Good,
    ).length;
    const totalCasts = this.cooldownUses.length;

    return (
      <HideGoodCastsSpellUsageSubSection
        explanation={explanation}
        uses={this.cooldownUses}
        castBreakdownSmallText={<> - Green is a good cast, Red is a bad cast.</>}
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={
          <div style={{ marginBottom: 10 }}>
            <CastPerformanceSummary
              spell={TALENTS.SIGIL_OF_FLAME_TALENT}
              casts={goodCasts}
              performance={QualitativePerformance.Good}
              totalCasts={totalCasts}
            />
            <strong>
              <SpellLink spell={TALENTS.SIGIL_OF_FLAME_TALENT} /> cast efficiency
            </strong>
            <CastEfficiencyBar
              spellId={this.spell.id}
              gapHighlightMode={GapHighlight.FullCooldown}
              minimizeIcons
              useThresholds
            />
          </div>
        }
      />
    );
  }

  private onCast(event: CastEvent) {
    const damages = getSigilOfFlameDamages(event);
    const performance =
      damages.length > 0 ? QualitativePerformance.Good : QualitativePerformance.Fail;
    const details =
      damages.length > 0 ? (
        <div>
          You hit at least one target with your <SpellLink spell={TALENTS.SIGIL_OF_FLAME_TALENT} />{' '}
          cast. Good job!
        </div>
      ) : (
        <div>
          You did not hit any targets with your <SpellLink spell={TALENTS.SIGIL_OF_FLAME_TALENT} />{' '}
          cast. Try to always hit at least one target with{' '}
          <SpellLink spell={TALENTS.SIGIL_OF_FLAME_TALENT} />.
        </div>
      );
    const isPrepull = event.prepull;

    const checklistItems: ChecklistUsageInfo[] = [];
    if (isPrepull) {
      checklistItems.push({
        check: 'prepull',
        timestamp: event.timestamp,
        performance: QualitativePerformance.Good,
        summary: <div>Cast before pull</div>,
        details: (
          <div>
            You cast <SpellLink spell={TALENTS.SIGIL_OF_FLAME_TALENT} /> before pulling the boss.
            Good job!
          </div>
        ),
      });
    } else {
      checklistItems.push({
        check: 'initial-hit',
        timestamp: event.timestamp,
        performance,
        summary: <div>Hit at least 1 target with cast</div>,
        details,
      });
    }
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

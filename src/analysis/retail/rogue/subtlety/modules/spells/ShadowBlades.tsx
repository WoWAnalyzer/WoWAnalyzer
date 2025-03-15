import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';
import { SpellUse, ChecklistUsageInfo } from 'parser/core/SpellUsage/core';
import { createChecklistItem, createSpellUse } from 'parser/core/MajorCooldowns/MajorCooldown';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { HideGoodCastsSpellUsageSubSection } from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';
import ComboPointTracker from 'analysis/retail/rogue/shared/ComboPointTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';

export default class ShadowBlades extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
    spellUsable: SpellUsable,
  };

  private cooldownUses: SpellUse[] = [];
  private comboPointTracker!: ComboPointTracker;
  private spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_BLADES_TALENT),
      this.onCast,
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.SHADOW_BLADES_TALENT} />
        </strong>{' '}
        is one of Subtlety Rogue's most important cooldowns. It should be used strategically with{' '}
        <SpellLink spell={SPELLS.FLAGELLATION} /> and major cooldowns like{' '}
        <SpellLink spell={SPELLS.SHADOW_DANCE} />.
      </p>
    );

    const goodCasts = this.cooldownUses.filter(
      (it) => it.performance === QualitativePerformance.Ok,
    ).length;
    const totalCasts = this.cooldownUses.length;

    return (
      <HideGoodCastsSpellUsageSubSection
        hideGoodCasts={false}
        explanation={explanation}
        uses={this.cooldownUses}
        castBreakdownSmallText={<> - Red indicates a wasted Shadow Blades.</>}
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={
          <div style={{ marginBottom: 10 }}>
            <CastPerformanceSummary
              spell={TALENTS.SHADOW_BLADES_TALENT}
              casts={goodCasts}
              performance={
                this.cooldownUses.length > 0
                  ? this.cooldownUses[0].performance
                  : QualitativePerformance.Fail
              }
              totalCasts={totalCasts}
            />
          </div>
        }
        noCastsTexts={{
          noCastsOverride: 'No Flagellation casts detected! This is a major mistake.',
        }}
      />
    );
  }

  private onCast(event: CastEvent) {
    const hasShadowDanceBuff = this.selectedCombatant.hasBuff(SPELLS.SHADOW_DANCE.id);
    const hasFlagellationBuff = this.selectedCombatant.hasBuff(SPELLS.FLAGELLATION.id);

    this.cooldownUses.push(
      createSpellUse({ event }, [
        this.buffAlignmentPerformance(event, hasShadowDanceBuff, hasFlagellationBuff),
      ]),
    );
  }

  private buffAlignmentPerformance(
    event: CastEvent,
    hasShadowDanceBuff: boolean,
    hasFlagellationBuff: boolean,
  ): ChecklistUsageInfo | undefined {
    let performance: QualitativePerformance;
    if (hasShadowDanceBuff && hasFlagellationBuff) {
      performance = QualitativePerformance.Perfect;
    } else if (hasShadowDanceBuff || hasFlagellationBuff) {
      performance = QualitativePerformance.Ok;
    } else {
      performance = QualitativePerformance.Fail;
    }

    return createChecklistItem(
      'flagellation_alignment',
      { event },
      {
        performance,
        summary: <div>Buff Alignment</div>,
        details: (
          <div>
            {hasShadowDanceBuff ? (
              <>
                ✔ <SpellLink spell={SPELLS.SHADOW_DANCE} /> buff was present.
              </>
            ) : (
              <>
                <SpellLink spell={SPELLS.SHADOW_DANCE} /> buff was not present.
              </>
            )}
            <br />
            {hasFlagellationBuff ? (
              <>
                ✔ <SpellLink spell={SPELLS.FLAGELLATION} /> buff was present.
              </>
            ) : (
              <>
                <SpellLink spell={SPELLS.FLAGELLATION} /> buff was not present.
              </>
            )}
          </div>
        ),
      },
    );
  }
}

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/rogue';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import SpellLink from 'interface/SpellLink';
import { HideGoodCastsSpellUsageSubSection } from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';
import { createSpellUse } from 'parser/core/MajorCooldowns/MajorCooldown';

export default class Backstab extends Analyzer {
  private cooldownUses: any[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BACKSTAB), this.onCast);
  }

  get guideSubsection() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.BACKSTAB} />
        </strong>{' '}
        is your primary filler ability when <SpellLink spell={SPELLS.SHADOWSTRIKE} /> is
        unavailable. Always make sure you are positioned **behind the target** to benefit from its
        increased damage effect.
      </p>
    );

    const goodCasts = this.cooldownUses.filter(
      (it) => it.performance === QualitativePerformance.Good,
    ).length;
    const totalCasts = this.cooldownUses.length;

    return (
      <HideGoodCastsSpellUsageSubSection
        hideGoodCasts
        explanation={explanation}
        uses={this.cooldownUses}
        castBreakdownSmallText={<> - Red is a bad cast.</>}
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={
          <div style={{ marginBottom: 10 }}>
            <CastPerformanceSummary
              spell={SPELLS.BACKSTAB}
              casts={goodCasts}
              performance={QualitativePerformance.Good}
              totalCasts={totalCasts}
            />
          </div>
        }
        noCastsTexts={{
          noCastsOverride: 'All of your casts of this spell were good!',
        }}
      />
    );
  }

  private onCast(event: CastEvent) {
    this.cooldownUses.push(createSpellUse({ event }, []));
  }
}

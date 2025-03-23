import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/rogue';
import SpellLink from 'interface/SpellLink';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { HideGoodCastsSpellUsageSubSection } from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';
import { createSpellUse, createChecklistItem } from 'parser/core/MajorCooldowns/MajorCooldown';
import { SpellUse } from 'parser/core/SpellUsage/core';

const STEALTH_BUFFS = [
  SPELLS.STEALTH.id,
  SPELLS.VANISH_BUFF.id,
  SPELLS.SHADOW_DANCE.id,
  SPELLS.SUBTERFUGE_BUFF.id,
];

export default class Shadowstrike extends Analyzer {
  private cooldownUses: SpellUse[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOWSTRIKE), this.onCast);
  }

  get guideSubsection() {
    const goodCasts = this.cooldownUses.filter(
      (it) => it.performance !== QualitativePerformance.Fail,
    ).length;
    const totalCasts = this.cooldownUses.length;

    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.SHADOWSTRIKE} />
        </strong>{' '}
        should <strong>only be used</strong> during <SpellLink spell={SPELLS.SHADOW_DANCE} />,{' '}
        <SpellLink spell={SPELLS.STEALTH} /> or <SpellLink spell={SPELLS.VANISH_BUFF} />. Using it
        outside of these conditions is a waste.
      </p>
    );

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
              spell={SPELLS.SHADOWSTRIKE}
              casts={goodCasts}
              performance={QualitativePerformance.Good}
              totalCasts={totalCasts}
            />
          </div>
        }
        noCastsTexts={{
          noCastsOverride: 'All of your casts of Shadowstrike were correctly used!',
        }}
      />
    );
  }

  private onCast(event: CastEvent) {
    const isStealthActive = STEALTH_BUFFS.some((buffId) =>
      this.selectedCombatant.hasBuff(buffId, event.timestamp),
    );

    const checklistItem = createChecklistItem(
      'shadowstrike-stealth-check',
      { event },
      {
        performance: isStealthActive ? QualitativePerformance.Good : QualitativePerformance.Fail,
        summary: isStealthActive ? (
          <div>Good usage during stealth or Shadow Dance.</div>
        ) : (
          <div>Incorrect usage outside stealth or Shadow Dance.</div>
        ),
        details: isStealthActive ? (
          <div>
            You correctly cast <SpellLink spell={SPELLS.SHADOWSTRIKE} /> during{' '}
            <SpellLink spell={SPELLS.SHADOW_DANCE} /> or stealth.
          </div>
        ) : (
          <div>
            <strong>Incorrect cast:</strong> You used <SpellLink spell={SPELLS.SHADOWSTRIKE} />{' '}
            outside of <SpellLink spell={SPELLS.SHADOW_DANCE} /> or stealth, which is a waste of
            resources.
          </div>
        ),
      },
    );

    this.cooldownUses.push(createSpellUse({ event }, [checklistItem]));
  }
}

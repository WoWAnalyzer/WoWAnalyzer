import type { JSX } from 'react';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { getPrayerOfHealingEvents } from '../../normalizers/CastLinkNormalizer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import '../Styling.scss';

class PrayerOfHealing extends Analyzer {
  prayerOfHealingCasts = 0;
  prayerOfHealingHealing = 0;
  prayerOfHealingOverhealing = 0;
  prayerOfHealingTargetsHit = 0;

  spellUses: SpellUse[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PRAYER_OF_HEALING_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PRAYER_OF_HEALING_TALENT),
      this.onPohCast,
    );
  }

  get overHealPercent() {
    return this.prayerOfHealingOverhealing / this.rawHealing;
  }

  get rawHealing() {
    return this.prayerOfHealingHealing + this.prayerOfHealingOverhealing;
  }

  get averageTargetsHit() {
    return this.prayerOfHealingTargetsHit / this.prayerOfHealingCasts;
  }

  onPohCast(event: CastEvent) {
    const healEvents = getPrayerOfHealingEvents(event);
    if (healEvents.length > 0) {
      this.prayerOfHealingCasts += 1;
    }

    const hasLightweaver = this.selectedCombatant.hasBuff(SPELLS.LIGHTWEAVER_TALENT_BUFF.id);
    const hasSurgeTalent = this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_LIGHT_TALENT);
    const hasSurgeBuff = hasSurgeTalent
      ? this.selectedCombatant.hasBuff(SPELLS.SURGE_OF_LIGHT_BUFF.id)
      : false;

    let overallPerformance: QualitativePerformance;
    if (hasLightweaver) {
      if (hasSurgeTalent && !hasSurgeBuff) {
        overallPerformance = QualitativePerformance.Good;
      } else {
        overallPerformance = QualitativePerformance.Perfect;
      }
    } else {
      overallPerformance = QualitativePerformance.Fail;
    }

    const checklistItems: ChecklistUsageInfo[] = [];

    const lightweaverItem = this.getLightweaverChecklistItem(
      event,
      hasLightweaver,
      overallPerformance === QualitativePerformance.Perfect,
    );
    checklistItems.push(lightweaverItem);

    if (hasSurgeTalent) {
      const surgeItem = this.getSurgeChecklistItem(event, hasSurgeBuff);
      checklistItems.push(surgeItem);
    }

    const spellUse: SpellUse = {
      event,
      performance: overallPerformance,
      checklistItems,
      performanceExplanation:
        overallPerformance === QualitativePerformance.Fail
          ? 'Bad Usage'
          : `${overallPerformance} Usage`,
    };

    this.spellUses.push(spellUse);
  }

  private getLightweaverChecklistItem(
    event: CastEvent,
    hasLightweaver: boolean,
    isPerfectCast: boolean,
  ): ChecklistUsageInfo {
    const summary = (
      <div>
        <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> buff applied
      </div>
    );

    let performance: QualitativePerformance;
    let details: JSX.Element;

    if (hasLightweaver) {
      if (isPerfectCast) {
        performance = QualitativePerformance.Perfect;
        details = (
          <div>
            You had <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> stacks when casting{' '}
            <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} />.
          </div>
        );
      } else {
        performance = QualitativePerformance.Good;
        details = (
          <div>
            You had <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> stacks when casting{' '}
            <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} />.
          </div>
        );
      }
    } else {
      performance = QualitativePerformance.Fail;
      details = (
        <div>
          You cast <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} /> without{' '}
          <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> stacks. Try to always have Lightweaver
          before casting.
        </div>
      );
    }

    return {
      check: 'lightweaver-active',
      timestamp: event.timestamp,
      performance,
      summary,
      details,
    };
  }

  private getSurgeChecklistItem(event: CastEvent, hasSurgeBuff: boolean): ChecklistUsageInfo {
    const summary = (
      <div>
        <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> buff applied
      </div>
    );

    let performance: QualitativePerformance;
    let details: JSX.Element;

    if (hasSurgeBuff) {
      performance = QualitativePerformance.Perfect;
      details = (
        <div>
          You had <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> stacks when casting{' '}
          <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} />.
        </div>
      );
    } else {
      // Changed from Fail to Ok – now yellow circle
      performance = QualitativePerformance.Ok;
      details = (
        <div>
          You cast <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} /> without{' '}
          <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> stacks. Consider using it for free
          casts.
        </div>
      );
    }

    return {
      check: 'surge-of-light-active',
      timestamp: event.timestamp,
      performance,
      summary,
      details,
    };
  }

  get guideSubsection(): JSX.Element | null {
    if (!this.active || this.spellUses.length === 0) {
      return null;
    }

    const hasSurge = this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_LIGHT_TALENT);

    const explanation = (
      <section>
        <strong>
          <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} />
        </strong>{' '}
        is your primary healing tool. It provides substantial burst healing on its own and is the
        most efficient way to reduce the cooldown of{' '}
        <SpellLink spell={TALENTS.HOLY_WORD_SANCTIFY_TALENT} />. Try to cast it when you have stacks
        of <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> to reduce cast time and mana cost.
        {hasSurge && (
          <p>
            If talented into <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} />, you can cast{' '}
            <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} /> when you have stacks of{' '}
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} />.
          </p>
        )}
      </section>
    );

    const castBreakdownSmallText = (
      <>
        {' '}
        - <span className="goodCast">Green</span> is a good cast where{' '}
        <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> is active.{' '}
        {hasSurge && (
          <>
            <span className="perfectCast">Blue</span> is a perfect cast where both{' '}
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> and{' '}
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> are active.{' '}
            <span className="okCast">Yellow</span> is a cast where{' '}
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> is talented but not active.
          </>
        )}
        <span className="badCast"> Red</span> is a bad cast without{' '}
        <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} />.
      </>
    );

    return (
      <ContextualSpellUsageSubSection
        title="Prayer of Healing"
        explanation={explanation}
        uses={this.spellUses}
        castBreakdownSmallText={castBreakdownSmallText}
        abovePerformanceDetails={<div style={{ marginBottom: 10 }}></div>}
      />
    );
  }
}

export default PrayerOfHealing;

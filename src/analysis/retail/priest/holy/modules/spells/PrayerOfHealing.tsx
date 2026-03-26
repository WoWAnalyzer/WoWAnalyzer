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
      if (hasSurgeBuff) {
        overallPerformance = QualitativePerformance.Perfect;
      } else {
        overallPerformance = QualitativePerformance.Good;
      }
    } else {
      if (hasSurgeBuff) {
        overallPerformance = QualitativePerformance.Ok;
      } else {
        overallPerformance = QualitativePerformance.Fail;
      }
    }

    const checklistItems: ChecklistUsageInfo[] = [];

    const lightweaverItem = this.getLightweaverChecklistItem(event, hasLightweaver, hasSurgeBuff);
    checklistItems.push(lightweaverItem);

    if (hasSurgeTalent) {
      const surgeItem = this.getSurgeChecklistItem(event, hasLightweaver, hasSurgeBuff);
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
    hasSurgeBuff: boolean,
  ): ChecklistUsageInfo {
    const summary = (
      <div>
        <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> buff applied
      </div>
    );

    let performance: QualitativePerformance;
    let details: JSX.Element;

    if (hasLightweaver) {
      if (hasSurgeBuff) {
        performance = QualitativePerformance.Perfect;
        details = (
          <div>
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> buff was applied. You had stacks when
            casting <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} />. Great job!
          </div>
        );
      } else {
        performance = QualitativePerformance.Good;
        details = (
          <div>
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> buff was applied. You had stacks when
            casting <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} />. Good job!
          </div>
        );
      }
    } else {
      performance = QualitativePerformance.Fail;
      details = (
        <div>
          <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> buff wasn't applied. You cast{' '}
          <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} /> without stacks. Try to always have
          Lightweaver before casting.
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

  private getSurgeChecklistItem(
    event: CastEvent,
    hasLightweaver: boolean,
    hasSurgeBuff: boolean,
  ): ChecklistUsageInfo {
    const summary = (
      <div>
        <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> buff applied
      </div>
    );

    let performance: QualitativePerformance;
    let details: JSX.Element;

    if (hasSurgeBuff) {
      if (hasLightweaver) {
        performance = QualitativePerformance.Perfect;
        details = (
          <div>
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> buff was applied. You had stacks
            when casting <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} />. Excellent!
          </div>
        );
      } else {
        performance = QualitativePerformance.Ok;
        details = (
          <div>
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> buff was applied, but{' '}
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> wasn't. Consider using them together
            for maximum benefit.
          </div>
        );
      }
    } else {
      if (hasLightweaver) {
        performance = QualitativePerformance.Ok;
        details = (
          <div>
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> buff wasn't applied, but you had{' '}
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> active. Consider using Surge of Light
            when available.
          </div>
        );
      } else {
        performance = QualitativePerformance.Fail;
        details = (
          <div>
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> buff wasn't applied, and{' '}
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> wasn't active. You should aim to have
            at least one buff.
          </div>
        );
      }
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
        - <span className="perfectCast">Blue</span> is a perfect cast with both{' '}
        <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> and{' '}
        <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> active.{' '}
        <span className="goodCast">Green</span> is a good cast with{' '}
        <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> active but no{' '}
        <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> stacks.{' '}
        {hasSurge && (
          <>
            <span className="okCast">Yellow</span> is an OK cast with{' '}
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> active without{' '}
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} />.{' '}
          </>
        )}
        <span className="badCast">Red</span> is a bad cast with neither buff active.
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

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
import styles from '../Styling.module.scss';

class PrayerOfHealing extends Analyzer {
  prayerOfHealingCasts = 0;
  prayerOfHealingHealing = 0;
  prayerOfHealingOverhealing = 0;
  prayerOfHealingTargetsHit = 0;

  spellUses: SpellUse[] = [];

  hasLightweaverTalent: boolean;
  hasSurgeTalent: boolean;
  hasSpiritwellTalent: boolean;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PRAYER_OF_HEALING_TALENT);
    this.hasLightweaverTalent = this.selectedCombatant.hasTalent(TALENTS.LIGHTWEAVER_TALENT);
    this.hasSurgeTalent = this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_LIGHT_TALENT);
    this.hasSpiritwellTalent = this.selectedCombatant.hasTalent(TALENTS.SPIRITWELL_TALENT);

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

    const hasLightweaver = this.hasLightweaverTalent
      ? this.selectedCombatant.hasBuff(SPELLS.LIGHTWEAVER_TALENT_BUFF.id)
      : false;
    const surgeEnabled = this.hasSurgeTalent && this.hasSpiritwellTalent;
    const hasSurgeBuff = surgeEnabled
      ? this.selectedCombatant.hasBuff(SPELLS.SURGE_OF_LIGHT_BUFF.id)
      : false;

    let overallPerformance: QualitativePerformance;
    const checklistItems: ChecklistUsageInfo[] = [];

    if (this.hasLightweaverTalent) {
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

      const lightweaverItem = this.getLightweaverChecklistItem(event, hasLightweaver, hasSurgeBuff);
      checklistItems.push(lightweaverItem);

      if (surgeEnabled) {
        const surgeItem = this.getSurgeChecklistItem(event, hasLightweaver, hasSurgeBuff);
        checklistItems.push(surgeItem);
      }
    } else {
      if (surgeEnabled) {
        overallPerformance = hasSurgeBuff
          ? QualitativePerformance.Good
          : QualitativePerformance.Fail;
        const surgeItem = this.getSurgeOnlyChecklistItem(event, hasSurgeBuff);
        checklistItems.push(surgeItem);
      } else {
        overallPerformance = QualitativePerformance.Ok;
      }
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
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> buff was applied.
          </div>
        );
      } else {
        performance = QualitativePerformance.Good;
        details = (
          <div>
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> buff was applied.
          </div>
        );
      }
    } else {
      performance = QualitativePerformance.Fail;
      details = (
        <div>
          <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> buff wasn't applied. Try to always have
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
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> buff was applied.
          </div>
        );
      } else {
        performance = QualitativePerformance.Ok;
        details = (
          <div>
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> buff was applied.
          </div>
        );
      }
    } else {
      if (hasLightweaver) {
        performance = QualitativePerformance.Ok;
        details = (
          <div>
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> buff wasn't applied. Consider using
            it for free casts.
          </div>
        );
      } else {
        performance = QualitativePerformance.Fail;
        details = (
          <div>
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> buff wasn't applied. Consider using
            it for free casts.
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

  private getSurgeOnlyChecklistItem(event: CastEvent, hasSurgeBuff: boolean): ChecklistUsageInfo {
    const summary = (
      <div>
        <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> buff applied
      </div>
    );

    const performance = hasSurgeBuff ? QualitativePerformance.Good : QualitativePerformance.Fail;
    const details = hasSurgeBuff ? (
      <div>
        <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> buff was applied.
      </div>
    ) : (
      <div>
        <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> buff wasn't applied. Consider using it
        for free casts.
      </div>
    );

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

    const explanation = (
      <section>
        <strong>
          <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} />
        </strong>{' '}
        is your primary healing tool. It provides substantial burst healing on its own and is the
        most efficient way to reduce the cooldown of{' '}
        <SpellLink spell={TALENTS.HOLY_WORD_SANCTIFY_TALENT} />.
        {this.hasLightweaverTalent && (
          <>
            {' '}
            Try to cast it when you have stacks of <SpellLink
              spell={TALENTS.LIGHTWEAVER_TALENT}
            />{' '}
            to reduce cast time and mana cost.
          </>
        )}
        {this.hasSurgeTalent && this.hasSpiritwellTalent && (
          <p>
            If talented into <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} />, you can cast{' '}
            <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} /> when you have stacks of{' '}
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} />.
          </p>
        )}
      </section>
    );

    const surgeRelevant = this.hasSurgeTalent && this.hasSpiritwellTalent;
    const hasLightweaver = this.hasLightweaverTalent;
    const hasSurge = surgeRelevant;

    let castBreakdownSmallText: JSX.Element | undefined;

    let scenario: 'both' | 'lightweaver-only' | 'surge-only';
    if (hasLightweaver && hasSurge) {
      scenario = 'both';
    } else if (hasLightweaver) {
      scenario = 'lightweaver-only';
    } else if (hasSurge) {
      scenario = 'surge-only';
    } else {
      scenario = 'lightweaver-only';
    }

    switch (scenario) {
      case 'both':
        castBreakdownSmallText = (
          <>
            {' '}
            - <span className={styles.perfectCast}>Blue</span> is a perfect cast with both{' '}
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> and{' '}
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> active.{' '}
            <span className={styles.goodCast}>Green</span> is a good cast with{' '}
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> active but no{' '}
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> stacks.{' '}
            <span className={styles.okCast}>Yellow</span> is an OK cast with{' '}
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> active without{' '}
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} />. <span className="badCast">Red</span>{' '}
            is a bad cast with neither buff active.
          </>
        );
        break;
      case 'lightweaver-only':
        castBreakdownSmallText = (
          <>
            {' '}
            - <span className={styles.goodCast}>Green</span> is a good cast with{' '}
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> active.{' '}
            <span className={styles.badCast}>Red</span> is a bad cast without{' '}
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} />.
          </>
        );
        break;
      case 'surge-only':
        castBreakdownSmallText = (
          <>
            {' '}
            - <span className={styles.goodCast}>Green</span> is a good cast with{' '}
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> active.{' '}
            <span className={styles.badCast}>Red</span> is a bad cast without{' '}
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} />.
          </>
        );
        break;
    }

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

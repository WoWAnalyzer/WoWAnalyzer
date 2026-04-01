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
  hasDivinityTalent: boolean;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PRAYER_OF_HEALING_TALENT);
    this.hasLightweaverTalent = this.selectedCombatant.hasTalent(TALENTS.LIGHTWEAVER_TALENT);
    this.hasSurgeTalent = this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_LIGHT_TALENT);
    this.hasSpiritwellTalent = this.selectedCombatant.hasTalent(TALENTS.SPIRITWELL_TALENT);
    this.hasDivinityTalent = this.selectedCombatant.hasTalent(TALENTS.DIVINITY_TALENT);

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
    const hasDivinityBuff = this.hasDivinityTalent
      ? this.selectedCombatant.hasBuff(SPELLS.DIVINITY_BUFF.id)
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
        const anyBuffActive = hasSurgeBuff || hasDivinityBuff;
        if (anyBuffActive) {
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

      if (hasDivinityBuff) {
        const divinityItem = this.getDivinityChecklistItem(
          event,
          hasDivinityBuff,
          overallPerformance === QualitativePerformance.Perfect,
        );
        checklistItems.push(divinityItem);
      }
    } else {
      if (surgeEnabled || this.hasDivinityTalent) {
        const anyBuffActive = hasSurgeBuff || hasDivinityBuff;
        if (anyBuffActive) {
          overallPerformance =
            hasSurgeBuff && hasDivinityBuff
              ? QualitativePerformance.Good
              : QualitativePerformance.Ok;
        } else {
          overallPerformance = QualitativePerformance.Fail;
        }

        if (surgeEnabled) {
          const surgeItem = this.getSurgeOnlyChecklistItem(event, hasSurgeBuff);
          checklistItems.push(surgeItem);
        }
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

  private getDivinityChecklistItem(
    event: CastEvent,
    _hasDivinityBuff: boolean,
    isPerfectCast: boolean,
  ): ChecklistUsageInfo {
    const summary = (
      <div>
        <SpellLink spell={TALENTS.DIVINITY_TALENT} /> buff applied
      </div>
    );

    const performance = isPerfectCast
      ? QualitativePerformance.Perfect
      : QualitativePerformance.Good;
    const details = (
      <div>
        <SpellLink spell={TALENTS.DIVINITY_TALENT} /> buff was applied.
      </div>
    );

    return {
      check: 'divinity-active',
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
            If talented into <SpellLink spell={TALENTS.SPIRITWELL_TALENT} />, you can cast{' '}
            <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} /> when you have stacks of{' '}
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} />.
          </p>
        )}
      </section>
    );

    const surgeRelevant = this.hasSurgeTalent && this.hasSpiritwellTalent;
    const hasLightweaver = this.hasLightweaverTalent;
    const hasSurge = surgeRelevant;
    const hasDivinity = this.hasDivinityTalent;

    let castBreakdownSmallText: JSX.Element | undefined;

    let scenario:
      | 'both'
      | 'lightweaver-only'
      | 'surge-only'
      | 'divinity-only'
      | 'lightweaver-surge'
      | 'lightweaver-divinity'
      | 'surge-divinity';
    if (hasLightweaver && hasSurge && hasDivinity) scenario = 'both';
    else if (hasLightweaver && hasSurge) scenario = 'lightweaver-surge';
    else if (hasLightweaver && hasDivinity) scenario = 'lightweaver-divinity';
    else if (hasSurge && hasDivinity) scenario = 'surge-divinity';
    else if (hasLightweaver) scenario = 'lightweaver-only';
    else if (hasSurge) scenario = 'surge-only';
    else if (hasDivinity) scenario = 'divinity-only';
    else scenario = 'lightweaver-only';

    switch (scenario) {
      case 'both':
        castBreakdownSmallText = (
          <>
            {' '}
            - <span className={styles.perfectCast}>Blue</span> is a perfect cast with{' '}
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} />,{' '}
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> and{' '}
            <SpellLink spell={TALENTS.DIVINITY_TALENT} /> active.{' '}
            <span className={styles.goodCast}>Green</span> is a good cast with at least one of these
            buffs. <span className={styles.okCast}>Yellow</span> is an OK cast with one buff but
            without <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} />.{' '}
            <span className={styles.badCast}>Red</span> is a bad cast with none of the buffs active.
          </>
        );
        break;
      case 'lightweaver-surge':
      case 'lightweaver-divinity':
      case 'surge-divinity':
        castBreakdownSmallText = (
          <>
            {' '}
            <span className={styles.goodCast}>Green</span> is a good cast with{' '}
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> active.{' '}
            <span className={styles.okCast}>Yellow</span> is an OK cast with{' '}
            <SpellLink spell={TALENTS.DIVINITY_TALENT} /> buff without{' '}
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> active.{' '}
            <span className={styles.badCast}>Red</span> is a bad cast with no buffs active.
          </>
        );
        break;
      case 'lightweaver-only':
        castBreakdownSmallText = (
          <>
            {' '}
            - <span className={styles.goodCast}>Green</span> is a good cast with{' '}
            <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> active.{' '}
            <span className={styles.badCast}>Red</span> is a bad cast without it.
          </>
        );
        break;
      case 'surge-only':
        castBreakdownSmallText = (
          <>
            {' '}
            - <span className={styles.goodCast}>Green</span> is a good cast with{' '}
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> active.{' '}
            <span className={styles.badCast}>Red</span> is a bad cast without it.
          </>
        );
        break;
      case 'divinity-only':
        castBreakdownSmallText = (
          <>
            {' '}
            - <span className={styles.goodCast}>Green</span> is a good cast with{' '}
            <SpellLink spell={TALENTS.DIVINITY_TALENT} /> active.{' '}
            <span className={styles.badCast}>Red</span> is a bad cast without it.
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

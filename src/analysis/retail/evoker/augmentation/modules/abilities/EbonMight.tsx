import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS/evoker';
import {
  EBON_MIGHT_BASE_DURATION_MS,
  TIMEWALKER_BASE_EXTENTION,
  ERUPTION_EXTENTION_MS,
  EMPOWER_EXTENTION_MS,
  BREATH_OF_EONS_EXTENTION_MS,
  SANDS_OF_TIME_CRIT_MOD,
} from 'analysis/retail/evoker/augmentation/constants';
import StatTracker from 'parser/shared/modules/StatTracker';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import HideGoodCastsSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';
import { ebonIsFromBreath } from '../normalizers/CastLinkNormalizer';

const PANDEMIC_WINDOW = 0.3;

/**
 * Ebon Might is the most important spell in Augmentations kit
 * It provides your targets with a percentage of your own mainstat,
 * as well as making them targets for Breath of Eon damage component.
 *
 * Ebon Might gets it duration increased by an amount equal to our Mastery,
 * along with being extended by Sands of Time.
 * Since we can't get the current duration easily we will instead by calculating
 * a rough estimation of the duration, since we need it for refresh analysis.
 * This is obviously not going to give 100% accurate results, but should be within
 * a range that we can give decently accurate analysis.
 */

interface EbonMightCooldownCast {
  event: AnyEvent;
  prescienceBuffsActive: number;
  oldBuffRemainder: number;
  currentMastery: number;
}

class EbonMight extends Analyzer {
  static dependencies = {
    stats: StatTracker,
  };
  protected stats!: StatTracker;

  currentPrescienceTargets: number = 0;

  private uses: SpellUse[] = [];
  private ebonMightCasts: EbonMightCooldownCast[] = [];

  ebonMightActive: boolean = false;
  currentEbonMightDuration: number = 0;
  currentEbonMightCastTime: number = 0;

  trackedSpells = [
    SPELLS.FIRE_BREATH,
    SPELLS.FIRE_BREATH_FONT,
    SPELLS.UPHEAVAL,
    SPELLS.UPHEAVAL_FONT,
    TALENTS.ERUPTION_TALENT,
    TALENTS.BREATH_OF_EONS_TALENT,
  ];

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_PERSONAL),
      this.onEbonApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_PERSONAL),
      this.onEbonRemove,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_PERSONAL),
      this.onEbonRefresh,
    );

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.trackedSpells), this.onCast);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PRESCIENCE_BUFF),
      this.onPrescienceApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PRESCIENCE_BUFF),
      this.onPrescienceRemove,
    );

    this.addEventListener(Events.fightend, this.finalize);
  }

  private onEbonApply(event: ApplyBuffEvent) {
    this.ebonMightCasts.push({
      event: event,
      prescienceBuffsActive: this.currentPrescienceTargets,
      oldBuffRemainder: this.ebonMightTimeLeft(event),
      currentMastery: this.stats.currentMasteryPercentage,
    });
    this.currentEbonMightDuration = ebonIsFromBreath(event)
      ? 5
      : this.calculateEbonMightDuration(event);
    this.currentEbonMightCastTime = event.timestamp;
    this.ebonMightActive = true;
    //console.log('Applied at: ' +formatDuration(event.timestamp - this.owner.fight.start_time) +' Duration: ' +this.currentEbonMightDuration,);
  }

  private onEbonRemove(event: RemoveBuffEvent) {
    this.ebonMightActive = false;
    this.currentEbonMightDuration = 0;
    //console.log('Removed at: ' + formatDuration(event.timestamp - this.owner.fight.start_time));
  }

  private onEbonRefresh(event: RefreshBuffEvent) {
    this.ebonMightCasts.push({
      event: event,
      prescienceBuffsActive: this.currentPrescienceTargets,
      oldBuffRemainder: this.ebonMightTimeLeft(event),
      currentMastery: this.stats.currentMasteryPercentage,
    });
    this.currentEbonMightDuration = this.calculateEbonMightDuration(event);
    this.currentEbonMightCastTime = event.timestamp;
    //console.log('Refreshed at: ' + formatDuration(event.timestamp - this.owner.fight.start_time) +' Duration: ' +this.currentEbonMightDuration,);
  }

  private onPrescienceApply() {
    this.currentPrescienceTargets = this.currentPrescienceTargets + 1;
  }
  private onPrescienceRemove() {
    this.currentPrescienceTargets = this.currentPrescienceTargets - 1;
  }

  private onCast(event: CastEvent) {
    this.extendEbongMight(event);
  }

  /* Here we figure out how long the duration should be based on current mastery
   * as well pandemiccing the current buff if we are refreshing */
  private calculateEbonMightDuration(event: AnyEvent) {
    const masteryPercentage = this.stats.currentMasteryPercentage;
    let ebonMightTimeLeft = this.ebonMightTimeLeft(event);
    const ebonMightCastDuration =
      EBON_MIGHT_BASE_DURATION_MS * (1 + TIMEWALKER_BASE_EXTENTION + masteryPercentage);

    if (ebonMightTimeLeft > ebonMightCastDuration * PANDEMIC_WINDOW) {
      ebonMightTimeLeft = ebonMightCastDuration * PANDEMIC_WINDOW;
    }

    const ebonMightDuration = ebonMightCastDuration + ebonMightTimeLeft;

    return ebonMightDuration;
  }

  /* Here we figure out how much to extend the current buffs, we average
   * out the crit chance of the +50% effect, gives accurate enough results
   * for what we need.*/
  private extendEbongMight(event: CastEvent) {
    if (!this.ebonMightActive) {
      return;
    }

    const ebonMightTimeLeft = this.ebonMightTimeLeft(event);
    const critChance = this.stats.currentCritPercentage;
    const critMod = 1 + SANDS_OF_TIME_CRIT_MOD * critChance;

    let newEbonMightDuration;

    if (event.ability.guid === TALENTS.BREATH_OF_EONS_TALENT.id) {
      newEbonMightDuration = ebonMightTimeLeft + BREATH_OF_EONS_EXTENTION_MS * critMod;
    } else if (event.ability.guid === TALENTS.ERUPTION_TALENT.id) {
      newEbonMightDuration = ebonMightTimeLeft + ERUPTION_EXTENTION_MS * critMod;
    } else {
      newEbonMightDuration = ebonMightTimeLeft + EMPOWER_EXTENTION_MS * critMod;
    }

    this.currentEbonMightCastTime = event.timestamp;
    this.currentEbonMightDuration = newEbonMightDuration;
    //console.log('Ebon Might Extended: ' +this.currentEbonMightDuration / 1000 +' timestamp: ' + formatDuration(event.timestamp - this.owner.fight.start_time), );
  }

  private ebonMightTimeLeft(event: AnyEvent) {
    if (this.currentEbonMightCastTime === 0) {
      return 0;
    }
    const timeSinceLast = event.timestamp - this.currentEbonMightCastTime;
    //console.log('Time since last: ' + timeSinceLast / 1000);
    const ebonMightTimeLeft = this.currentEbonMightDuration - timeSinceLast;
    //console.log( 'Ebon Might Time Left: ' +ebonMightTimeLeft / 1000 +' timestamp: ' + formatDuration(event.timestamp - this.owner.fight.start_time),);
    if (ebonMightTimeLeft < 0) {
      return 0;
    }
    return ebonMightTimeLeft;
  }

  private finalize() {
    // finalize performances
    //console.log(this.ebonMightCasts);
    this.uses = this.ebonMightCasts.map(this.ebonMightUsage);
  }

  private ebonMightUsage(ebonMightCooldownCast: EbonMightCooldownCast): SpellUse {
    const prescienceBuffsActive = ebonMightCooldownCast.prescienceBuffsActive;
    const oldDuration = ebonMightCooldownCast.oldBuffRemainder;
    const ebonMightPandemicAmount =
      EBON_MIGHT_BASE_DURATION_MS *
      (1 + TIMEWALKER_BASE_EXTENTION + ebonMightCooldownCast.currentMastery) *
      PANDEMIC_WINDOW;

    let performance;
    let summary;
    let details;

    if (oldDuration > 0) {
      performance =
        oldDuration < ebonMightPandemicAmount
          ? QualitativePerformance.Perfect
          : QualitativePerformance.Fail;
      summary = (
        <div>
          Refreshed <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> inside the pandemic window.
        </div>
      );
      details =
        oldDuration < ebonMightPandemicAmount ? (
          <div>
            You refreshed <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> inside the pandemic
            window. Good job!
          </div>
        ) : (
          <div>
            You refreshed <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> before the pandemic
            window. <br />
            <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> had ~{(oldDuration / 1000).toFixed(2)}s
            remaining; Meaning you lost ~
            {((oldDuration - ebonMightPandemicAmount) / 1000).toFixed(2)}s of uptime.
          </div>
        );
    } else {
      summary = (
        <div>
          You had {ebonMightCooldownCast.prescienceBuffsActive}{' '}
          <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> active on cast.
        </div>
      );
      // Case 1: 2 buffed targets
      if (prescienceBuffsActive >= 2) {
        performance = QualitativePerformance.Perfect;
        details = (
          <div>
            You had {ebonMightCooldownCast.prescienceBuffsActive}{' '}
            <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> active on cast. Good job!
          </div>
        );
      }
      // Case 2: 1 buffed target
      else if (prescienceBuffsActive === 1) {
        performance = QualitativePerformance.Ok;
        details = (
          <div>
            You had {ebonMightCooldownCast.prescienceBuffsActive}{' '}
            <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> active on cast. Try to line it up so you
            have two active.
          </div>
        );
      }
      // Case 3: 0 buffed targets
      else {
        performance = QualitativePerformance.Fail;
        details = (
          <div>
            You didn't have any <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> active on cast! You
            should always make sure to get your <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />{' '}
            buffs out, so you can control who your <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} />{' '}
            goes on.
          </div>
        );
      }
    }

    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'buffed-targets',
        timestamp: ebonMightCooldownCast.event.timestamp,
        performance,
        summary,
        details,
      },
    ];

    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );

    return {
      event: ebonMightCooldownCast.event,
      performance: actualPerformance,
      checklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    };
  }

  guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const explanation = (
      <section>
        <strong>
          <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} />
        </strong>{' '}
        Is one of the most important spells in your entire kit. It provides 4 allies with a
        percentage of your mainstat, along with making them priority targets for{' '}
        <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} />.{' '}
        <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> prefers targets with{' '}
        <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> active.
        <br />
        <br />
        If you recast <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> whilst it's still active you
        will refresh the buff on your current targets.
      </section>
    );

    return (
      <HideGoodCastsSpellUsageSubSection
        title="Ebon Might"
        explanation={explanation}
        uses={this.uses}
        castBreakdownSmallText={
          <> - These boxes represent each cast, colored by how good the usage was.</>
        }
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={<div style={{ marginBottom: 10 }}></div>}
      />
    );
  }
}

export default EbonMight;

import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummary, { type CastEvaluation } from 'interface/guide/components/CastSummary';
import GuideSection from 'interface/guide/components/GuideSection';

import HeatingUp from '../core/HeatingUp';
import { formatDurationMillisMinSec } from 'common/format';

const CAPPED_MS_THRESHOLD = 7000;
const FEEL_THE_BURN_DURATION_THRESHOLD = 1500;

class HeatingUpGuide extends Analyzer {
  static dependencies = {
    heatingUp: HeatingUp,
  };

  protected heatingUp!: HeatingUp;

  hasFlameOn: boolean = this.selectedCombatant.hasTalent(TALENTS.FLAME_ON_TALENT);

  private evaluateHeatingUpCrit(hu: any): CastEvaluation {
    const fireBlastCapped =
      hu.cast.ability.guid === SPELLS.FIRE_BLAST.id &&
      hu.charges >= (this.hasFlameOn ? 3 : 1) - 1 &&
      hu.timeTillCapped < CAPPED_MS_THRESHOLD;

    const castWithoutHeatingUp = !hu.critBuff.active && !hu.hasHotStreak && !hu.hasHeatingUp;

    // GOOD CONDITIONS
    if (fireBlastCapped) {
      return {
        timestamp: hu.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: 'Fire Blast cast while capped on charges',
      };
    }

    if (hu.critBuff.active && hu.critBuff.buffId) {
      const buffName = SPELLS[hu.critBuff.buffId]?.name || 'Unknown Buff';
      return {
        timestamp: hu.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Fire Blast cast with ${buffName}`,
      };
    }

    if (!castWithoutHeatingUp) {
      return {
        timestamp: hu.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: 'Good - Proper Heating Up generation',
      };
    }

    if (hu.ftbDuration <= FEEL_THE_BURN_DURATION_THRESHOLD) {
      return {
        timestamp: hu.cast.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `${formatDurationMillisMinSec(hu.ftbDuration)}s left on Feel the Burn.`,
      };
    }

    // FAIL CONDITIONS
    if (!fireBlastCapped && castWithoutHeatingUp) {
      return {
        timestamp: hu.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `${hu.cast.ability.name} cast without Heating Up or crit buff - wasted charge`,
      };
    }

    // DEFAULT
    return {
      timestamp: hu.cast.timestamp,
      performance: QualitativePerformance.Good,
      reason: 'Good Fire Blast Usage',
    };
  }

  get guideSubsection(): JSX.Element {
    const fireblast = <SpellLink spell={SPELLS.FIRE_BLAST} />;
    const combustion = <SpellLink spell={TALENTS.COMBUSTION_TALENT} />;
    const heatingUp = <SpellLink spell={SPELLS.HEATING_UP} />;
    const hotStreak = <SpellLink spell={SPELLS.HOT_STREAK} />;
    const firestarter = <SpellLink spell={TALENTS.FIRESTARTER_TALENT} />;
    const searingTouch = <SpellLink spell={TALENTS.SCORCH_TALENT} />;
    const feelTheBurn = <SpellLink spell={TALENTS.FEEL_THE_BURN_TALENT} />;

    const explanation = (
      <>
        Properly managing <b>{heatingUp}</b> maximizes your {hotStreak} generation throughout the
        fight.
        <ul>
          <li>
            Use guaranteed crit abilities like {fireblast} to convert {heatingUp} to {hotStreak}.
          </li>
          <li>
            Unless you are guaranteed to crit ({combustion}, {firestarter}, {searingTouch}), or are
            capped/about to cap on charges, don't use {fireblast} without {heatingUp}.
          </li>
          <li>
            If you are getting close to {combustion} and {feelTheBurn} is about to expire, it can be
            acceptable to use {fireblast} without {heatingUp} to keep the buff maxed before{' '}
            {combustion}.
          </li>
        </ul>
      </>
    );

    return (
      <GuideSection spell={SPELLS.HEATING_UP} explanation={explanation}>
        <CastSummary
          spell={SPELLS.HEATING_UP}
          casts={this.heatingUp.heatingUpCrits.map((crit) => this.evaluateHeatingUpCrit(crit))}
          showBreakdown
        />
      </GuideSection>
    );
  }
}

export default HeatingUpGuide;

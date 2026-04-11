import TALENTS from 'common/TALENTS/priest';
import {
  MajorDefensiveBuff,
  Mitigation,
  absoluteMitigation,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import SpellLink from 'interface/SpellLink';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, EventType } from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode } from 'react';

const TRANSLUCENT_IMAGE_DAMAGE_REDUCTION = 0.1;
const PERFECT_MITIGATION_HP_FRACTION = 0.1;
const GOOD_MITIGATION_HP_FRACTION = 0.05;
const OK_MITIGATION_HP_FRACTION = 0.02;

class Fade extends MajorDefensiveBuff {
  constructor(options: Options) {
    super(TALENTS.FADE_TALENT, buff(TALENTS.FADE_TALENT), options);
    // Fade only becomes a real mitigation cooldown with Translucent Image.
    this.active = this.selectedCombatant.hasTalent(TALENTS.TRANSLUCENT_IMAGE_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  private onDamageTaken(event: DamageEvent) {
    if (!this.defensiveActive || event.sourceIsFriendly) {
      return;
    }

    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, TRANSLUCENT_IMAGE_DAMAGE_REDUCTION),
    });
  }

  explainPerformance(mit: Mitigation<EventType.ApplyBuff, EventType.RemoveBuff>): {
    perf: QualitativePerformance;
    explanation?: ReactNode;
  } {
    if (mit.amount >= this.firstSeenMaxHp * PERFECT_MITIGATION_HP_FRACTION) {
      return {
        perf: QualitativePerformance.Perfect,
        explanation: 'Usage mitigated over 10% of your max HP in damage',
      };
    }
    if (mit.amount >= this.firstSeenMaxHp * GOOD_MITIGATION_HP_FRACTION) {
      return {
        perf: QualitativePerformance.Good,
        explanation: 'Usage mitigated 5-10% of your max HP in damage',
      };
    }
    if (mit.amount >= this.firstSeenMaxHp * OK_MITIGATION_HP_FRACTION) {
      return {
        perf: QualitativePerformance.Ok,
        explanation: 'Usage mitigated 2-5% of your max HP in damage',
      };
    }
    return {
      perf: QualitativePerformance.Fail,
      explanation: 'Usage mitigated less than 2% of your max HP in damage - wasted cast',
    };
  }

  description(): ReactNode {
    return (
      <p>
        With <SpellLink spell={TALENTS.TRANSLUCENT_IMAGE_TALENT} />,{' '}
        <SpellLink spell={TALENTS.FADE_TALENT} /> reduces the damage you take by 10% for its
        duration.
      </p>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.TALENTS} />;
  }
}

export default Fade;

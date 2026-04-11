import SPELLS from 'common/SPELLS';
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

const PROTECTIVE_LIGHT_DAMAGE_REDUCTION = 0.1;
const PERFECT_MITIGATION_HP_FRACTION = 0.1;
const OK_MITIGATION_HP_FRACTION = 0.025;
const BAD_MITIGATION_HP_FRACTION = 0.01;

class ProtectiveLight extends MajorDefensiveBuff {
  constructor(options: Options) {
    super(TALENTS.PROTECTIVE_LIGHT_TALENT, buff(SPELLS.PROTECTIVE_LIGHT_BUFF), options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PROTECTIVE_LIGHT_TALENT);

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
      mitigatedAmount: absoluteMitigation(event, PROTECTIVE_LIGHT_DAMAGE_REDUCTION),
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
    if (mit.amount < this.firstSeenMaxHp * BAD_MITIGATION_HP_FRACTION) {
      return {
        perf: QualitativePerformance.Fail,
        explanation: 'Usage mitigated less than 1% of your max HP in damage - wasted cast',
      };
    }
    if (mit.amount < this.firstSeenMaxHp * OK_MITIGATION_HP_FRACTION) {
      return {
        perf: QualitativePerformance.Ok,
        explanation: 'Usage mitigated less than 2.5% of your max HP in damage',
      };
    }
    return { perf: QualitativePerformance.Good };
  }

  description(): ReactNode {
    const neverTriggered = this.mitigations.length === 0;
    return (
      <>
        <p>
          <SpellLink spell={TALENTS.PROTECTIVE_LIGHT_TALENT} /> reduces the damage you take by 10%
          for 10 seconds after casting <SpellLink spell={SPELLS.FLASH_HEAL} /> on yourself.
        </p>
        {neverTriggered && (
          <p style={{ color: 'red' }}>
            <strong>You took this talent but never triggered it.</strong> Cast{' '}
            <SpellLink spell={SPELLS.FLASH_HEAL} /> on yourself to activate the 10% damage
            reduction.
          </p>
        )}
      </>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.TALENTS} />;
  }
}

export default ProtectiveLight;

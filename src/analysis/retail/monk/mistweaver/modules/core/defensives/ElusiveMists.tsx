import { formatPercentage } from 'common/format';
import talents from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import {
  absoluteMitigation,
  buff,
  MajorDefensiveBuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ReactNode } from 'react';
import { ELUSIVE_MISTS_DR } from '../../../constants';

const soothingMistOnSelf = () => {
  const trigger = buff(talents.SOOTHING_MIST_TALENT);
  return {
    ...trigger,
    applyTrigger: trigger.applyTrigger.to(SELECTED_PLAYER),
    removeTrigger: trigger.removeTrigger.to(SELECTED_PLAYER),
  };
};

class ElusiveMists extends MajorDefensiveBuff {
  constructor(options: Options) {
    super(talents.SOOTHING_MIST_TALENT, soothingMistOnSelf(), options);

    this.active = this.selectedCombatant.hasTalent(talents.ELUSIVE_MISTS_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive(event)) return;

    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, ELUSIVE_MISTS_DR),
    });
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={talents.ELUSIVE_MISTS_TALENT} /> reduces damage taken by you and your
        target by {formatPercentage(ELUSIVE_MISTS_DR, 0)}% while you are channeling{' '}
        <SpellLink spell={talents.SOOTHING_MIST_TALENT} />. Only the damage you took yourself is
        counted here.
      </p>
    );
  }
}

export default ElusiveMists;

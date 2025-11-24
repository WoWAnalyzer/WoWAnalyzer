import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  HealEvent,
  BeginChannelEvent,
  EndChannelEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  DamageEvent,
} from 'parser/core/Events';
import { CAST_BUFFER_MS } from '../../normalizers/EventLinks/EventLinkConstants';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import {
  JADE_EMPOWERMENT_DAMAGE_BOOST,
  JADE_EMPOWERMENT_SECONDARY_TARGET_EFFECTIVENESS,
} from '../../constants';

class JadeEmpowerment extends Analyzer {
  wastedCharges = 0;
  hasJFT = false;
  insideCJLChannel = false;
  cjlChannelEndTime = 0;
  currentCJLHeal = 0;
  bonusDamage = 0;
  currentTarget = -1;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.JADE_EMPOWERMENT_TALENT);
    this.hasJFT = this.selectedCombatant.hasTalent(TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT);

    this.addEventListener(
      Events.BeginChannel.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING),
      this.onCastStart,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING),
      this.onCastEnd,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING),
      this.onDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.AT_HEAL, SPELLS.AT_CRIT_HEAL]),
      this.handleATHeal,
    );
  }

  onDamage(event: DamageEvent) {
    if (this.currentTarget == -1) return;
    this.bonusDamage +=
      event.targetID === this.currentTarget
        ? calculateEffectiveDamage(event, JADE_EMPOWERMENT_DAMAGE_BOOST)
        : calculateEffectiveDamage(
            event,
            JADE_EMPOWERMENT_DAMAGE_BOOST * JADE_EMPOWERMENT_SECONDARY_TARGET_EFFECTIVENESS,
          );
  }

  onCastStart(event: BeginChannelEvent) {
    this.currentCJLHeal = 0;
    this.insideCJLChannel = true;
    this.currentTarget = event.targetID || -1;
  }

  handleATHeal(event: HealEvent) {
    if (this.insideCJLChannel || event.timestamp <= this.cjlChannelEndTime + CAST_BUFFER_MS) {
      this.currentCJLHeal += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  checkForRefresh(event: CastEvent) {
    if (this.selectedCombatant.getBuffStacks(SPELLS.JADE_EMPOWERMENT_BUFF) == 2) {
      this.wastedCharges += 1;
    }
  }

  onCastEnd(event: RemoveBuffEvent | RemoveBuffStackEvent | EndChannelEvent) {
    this.cjlChannelEndTime = event.timestamp;
    this.insideCJLChannel = false;
  }
}

export default JadeEmpowerment;
